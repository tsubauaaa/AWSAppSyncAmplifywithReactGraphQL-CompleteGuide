import { useEffect, useState } from "react";
import { listPosts } from "../graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import { ListPostsQuery, OnCreatePostSubscription } from "../API";
import { GraphQLResult } from "aws-amplify/node_modules/@aws-amplify/api-graphql";
import DeletePost from "./DeletePost";
import EditPost from "./EditPost";
import { onCreatePost } from "../graphql/subscriptions";

type Post = {
  id: string;
  postBody: string;
  postTitle: string;
  postOwnerId: string;
  postOwnerUsername: string;
  createdAt: string;
};

type PostSubscriptionEvent = {
  value: { data: OnCreatePostSubscription };
};

const DisplayPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  // console.log("All Posts: ", JSON.stringify(posts));
  //   console.log("All Posts: ", posts);
  useEffect(() => {
    getPosts();
    createPostListener();
  }, []);

  const getPosts = async () => {
    const apiData = (await API.graphql(
      graphqlOperation(listPosts)
    )) as GraphQLResult<ListPostsQuery>;
    setPosts(apiData.data?.listPosts?.items as Post[]);
  };

  const createPostListener = async () => {
    const client = API.graphql(graphqlOperation(onCreatePost));
    if ("subscribe" in client) {
      client.subscribe({
        next: (postData: PostSubscriptionEvent) => {
          const {
            value: { data },
          } = postData;
          if (data.onCreatePost) {
            const newPost = data.onCreatePost;
            setPosts((prev) => [...prev, newPost as Post]);
          }
        },
      });
    }
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
              <DeletePost />
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
