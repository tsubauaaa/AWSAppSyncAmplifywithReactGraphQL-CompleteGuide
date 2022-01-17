import { useEffect, useState } from "react";
import { listPosts } from "../graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import {
  ListPostsQuery,
  OnCreateCommentSubscription,
  OnCreatePostSubscription,
  OnDeletePostSubscription,
  OnUpdatePostSubscription,
  Post,
} from "../API";
import { GraphQLResult } from "aws-amplify/node_modules/@aws-amplify/api-graphql";
import DeletePost from "./DeletePost";
import EditPost from "./EditPost";
import {
  onCreateComment,
  onCreatePost,
  onDeletePost,
  onUpdatePost,
} from "../graphql/subscriptions";
import CreateCommentPost from "./CreateCommentPost";

type CreatePostSubscriptionEvent = {
  value: { data: OnCreatePostSubscription };
};

type DeletePostSubscriptionEvent = {
  value: { data: OnDeletePostSubscription };
};

type UpdatePostSubscriptionEvent = {
  value: { data: OnUpdatePostSubscription };
};

type CreateCommentSubscriptionEvent = {
  value: { data: OnCreateCommentSubscription };
};

const DisplayPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const apiData = (await API.graphql(
      graphqlOperation(listPosts)
    )) as GraphQLResult<ListPostsQuery>;
    setPosts(apiData.data?.listPosts?.items as Post[]);
  };

  useEffect(() => {
    const client = API.graphql(graphqlOperation(onCreatePost));
    if ("subscribe" in client) {
      const sub = () =>
        client.subscribe({
          next: async (postData: CreatePostSubscriptionEvent) => {
            const {
              value: { data },
            } = postData;
            if (data.onCreatePost) {
              const newPost = data.onCreatePost;
              setPosts((prev) => [...prev, newPost as Post]);
            }
          },
        });
      const listener = sub();
      return () => listener.unsubscribe();
    }
  }, [posts]);

  useEffect(() => {
    const client = API.graphql(graphqlOperation(onDeletePost));
    if ("subscribe" in client) {
      const sub = () =>
        client.subscribe({
          next: async (postData: DeletePostSubscriptionEvent) => {
            const {
              value: { data },
            } = postData;
            if (data.onDeletePost) {
              const deletePost = data.onDeletePost;
              const updatedPosts = posts.filter(
                (post) => post.id !== deletePost.id
              );
              setPosts(updatedPosts);
            }
          },
        });
      const listener = sub();
      return () => listener.unsubscribe();
    }
  }, [posts]);

  useEffect(() => {
    const client = API.graphql(graphqlOperation(onUpdatePost));
    if ("subscribe" in client) {
      const sub = () =>
        client.subscribe({
          next: async (postData: UpdatePostSubscriptionEvent) => {
            const {
              value: { data },
            } = postData;
            if (data.onUpdatePost) {
              const updatePost = data.onUpdatePost;
              const index = posts.findIndex(
                (post) => post.id === updatePost.id
              );
              const updatePosts = [
                ...posts.slice(0, index),
                updatePost,
                ...posts.slice(index + 1),
              ];
              setPosts(updatePosts as Post[]);
            }
          },
        });
      const listener = sub();
      return () => listener.unsubscribe();
    }
  }, [posts]);

  //   useEffect(() => {
  //     const client = API.graphql(graphqlOperation(onCreateComment));
  //     if ("subscribe" in client) {
  //         const sub = () => client.subscribe({
  //             next: async (commentData: CreateCommentSubscriptionEvent) => {
  //                 const createdComment = commentData.value.data.onCreateComment;
  //                 setPosts((prev) => {
  //                     for (let post of prev) {
  //                         if (createdComment?.post.id === post.id) {
  //                             post.comments?.items.push(createdComment);
  //                         }
  //                     }
  //                 })
  //         })
  //   }, [posts]);

  return (
    <>
      {posts.map((post) => {
        return (
          <div className="posts" style={rowStyle} key={post.id}>
            <h1>{post.postTitle}</h1>
            <span style={{ fontStyle: "italic", color: "#0ca5e297" }}>
              {"Wrote by:"} {post.postOwnerUsername}
              {" on "}
              <time style={{ fontStyle: "italic" }}>
                {" "}
                {new Date(post.createdAt!).toDateString()}
              </time>
            </span>
            <p>{post.postBody}</p>

            <br></br>
            <span>
              <DeletePost id={post.id} />
              <EditPost {...post} />
            </span>
            <span>
              <CreateCommentPost postId={post.id} />
            </span>
          </div>
        );
      })}
    </>
  );
};

const rowStyle = {
  background: "#f4f4f4",
  padding: "10px",
  border: "1px #ccc dotted",
  margin: "14px",
};

export default DisplayPosts;
