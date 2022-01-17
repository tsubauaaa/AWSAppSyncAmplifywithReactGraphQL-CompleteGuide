import { useEffect, useState } from "react";
import { listPosts } from "../graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import {
  ListPostsQuery,
  OnCreatePostSubscription,
  OnDeletePostSubscription,
} from "../API";
import { GraphQLResult } from "aws-amplify/node_modules/@aws-amplify/api-graphql";
import DeletePost from "./DeletePost";
import EditPost from "./EditPost";
import { onCreatePost, onDeletePost } from "../graphql/subscriptions";

type Post = {
  id: string;
  postBody: string;
  postTitle: string;
  postOwnerId: string;
  postOwnerUsername: string;
  createdAt: string;
};

type CreatePostSubscriptionEvent = {
  value: { data: OnCreatePostSubscription };
};

type DeletePostSubscriptionEvent = {
  value: { data: OnDeletePostSubscription };
};

const DisplayPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

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
          next: async (deleteData: DeletePostSubscriptionEvent) => {
            const {
              value: { data },
            } = deleteData;
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

  const fetchPosts = async () => {
    const apiData = (await API.graphql(
      graphqlOperation(listPosts)
    )) as GraphQLResult<ListPostsQuery>;
    setPosts(apiData.data?.listPosts?.items as Post[]);
  };

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
                {new Date(post.createdAt).toDateString()}
              </time>
            </span>
            <p>{post.postBody}</p>

            <br></br>
            <span>
              <DeletePost id={post.id} />
              <EditPost />
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
