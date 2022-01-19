import { useEffect, useState } from "react";
import { listPosts } from "../graphql/queries";
import { API, Auth, graphqlOperation } from "aws-amplify";
import {
  ListPostsQuery,
  OnCreateCommentSubscription,
  OnCreateLikeSubscription,
  OnCreatePostSubscription,
  OnDeletePostSubscription,
  OnUpdatePostSubscription,
  Post,
} from "../API";
import DeletePost from "./DeletePost";
import EditPost from "./EditPost";
import {
  onCreateComment,
  onCreateLike,
  onCreatePost,
  onDeletePost,
  onUpdatePost,
} from "../graphql/subscriptions";
import CreateCommentPost from "./CreateCommentPost";
import CommentPost from "./CommentPost";
import UsersWhoLikedPost from "./UsersWhoLikedPost";
import { FaSadTear, FaThumbsUp } from "react-icons/fa";
import { createLike } from "../graphql/mutations";
import { GraphQLResult } from "aws-amplify/node_modules/@aws-amplify/api-graphql";

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

type CreateLikeSubscriptionEvent = {
  value: { data: OnCreateLikeSubscription };
};

const DisplayPosts = () => {
  const [ownerId, setOwnerId] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [postLikedBy, setPostLikedBy] = useState<string[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  // fetch posts
  useEffect(() => {
    fetchPosts();
    currentUserInfo();
  }, []);

  // create post subscription
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
              setPosts((prev) => [...prev, newPost]);
            }
          },
        });
      const listener = sub();
      return () => listener.unsubscribe();
    }
  }, [posts]);

  // delete post subscription
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

  // update post subscription
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

  // create comment subscription
  useEffect(() => {
    const client = API.graphql(graphqlOperation(onCreateComment));
    if ("subscribe" in client) {
      const sub = () =>
        client.subscribe({
          next: async (commentData: CreateCommentSubscriptionEvent) => {
            const createdComment = commentData.value.data.onCreateComment;
            let temp = [...posts];
            for (let post of temp) {
              if (createdComment?.post?.id === post.id) {
                post.comments?.items.push(createdComment as any);
              }
            }
            setPosts(temp);
          },
        });

      const listener = sub();
      return () => listener.unsubscribe();
    }
  }, [posts]);

  // create like subscription
  useEffect(() => {
    const client = API.graphql(graphqlOperation(onCreateLike));
    if ("subscribe" in client) {
      const sub = () =>
        client.subscribe({
          next: async (commentData: CreateLikeSubscriptionEvent) => {
            const createdLike = commentData.value.data.onCreateLike;
            let temp = [...posts];
            for (let post of temp) {
              if (createdLike?.post?.id === post.id) {
                post.likes?.items.push(createdLike as any);
              }
            }
            setPosts(temp);
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
    setPosts(apiData.data?.listPosts?.items as Array<Post>);
  };

  const currentUserInfo = async () => {
    await Auth.currentUserInfo().then((user) => {
      setOwnerId(user.attributes.sub);
      setOwnerUsername(user.username);
    });
  };

  const likedPost = (postId: string) => {
    for (let post of posts) {
      if (post.id === postId) {
        if (post.postOwnerId === ownerId) return true;
        for (let like of post.likes?.items!) {
          if (like!.likeOwnerId === ownerId) return true;
        }
      }
    }
    return false;
  };

  const handleMouseHover = async (postId: string) => {
    setIsHovering(!isHovering);
    const innerLikes = postLikedBy;
    for (let post of posts) {
      if (post.id === postId) {
        for (let like of post.likes?.items!) {
          innerLikes.push(like?.likeOwnerUsername!);
        }
      }
      setPostLikedBy(innerLikes);
    }
    console.log("Post liked by: ", postLikedBy);
  };

  const handleMouseHoverLeave = () => {
    setIsHovering(!isHovering);
    setPostLikedBy([]);
  };

  const handleLike = async (postId: string) => {
    if (likedPost(postId)) {
      return setErrorMessage("Can't Like Your Own Post.");
    } else {
      const input = {
        numberLikes: 1,
        likeOwnerId: ownerId,
        likeOwnerUsername: ownerUsername,
        likePostId: postId,
      };

      try {
        const result: any = await API.graphql(
          graphqlOperation(createLike, { input })
        );
        console.log("Liked: ", result.data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  console.log("Posts: ", posts);

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
            <br />
            <span>
              {post.postOwnerId === ownerId && <DeletePost id={post.id} />}

              {post.postOwnerId === ownerId && <EditPost {...post} />}
              <span>
                <p className="alert">
                  {post.postOwnerId === ownerId && errorMessage}
                </p>
                <p
                  onMouseEnter={() => handleMouseHover(post.id)}
                  onMouseLeave={() => handleMouseHoverLeave()}
                  onClick={() => handleLike(post.id)}
                  style={{
                    color: post.likes?.items?.length! > 0 ? "blue" : "gray",
                  }}
                  className="like-button"
                >
                  <FaThumbsUp />
                  {post.likes?.items?.length}
                </p>
                {isHovering && (
                  <div className="user-liked">
                    {postLikedBy.length === 0
                      ? " Liked by No one "
                      : "Liked by:"}
                    {postLikedBy.length === 0 ? (
                      <FaSadTear />
                    ) : (
                      <UsersWhoLikedPost allUsers={postLikedBy} />
                    )}
                  </div>
                )}
              </span>
            </span>

            <span>
              <CreateCommentPost postId={post.id} />
              {post.comments?.items?.length! > 0 && (
                <span style={{ fontSize: "19px", color: "gray" }}>
                  Comments:
                </span>
              )}
              {post.comments?.items?.map((comment, index) => (
                <CommentPost key={index} {...comment!} />
              ))}
            </span>
            <p className="alert">
              {post.postOwnerId === ownerId && errorMessage}
            </p>
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
