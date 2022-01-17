import React, { useEffect, useState } from "react";
import { createPost } from "../graphql/mutations";
import { API, Auth, graphqlOperation } from "aws-amplify";

const CreatePost = () => {
  const [postOwnerId, setPostOwnerId] = useState("");
  const [postOwnerUsername, setPostOwnerUsername] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");

  useEffect(() => {
    currentUserInfo();
  }, []);

  const handleChangePostTitle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPostTitle(event.target.value);
  };

  const handleChangePostBody = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPostBody(event.target.value);
  };

  const handleAddPost = () => {
    const input = {
      postOwnerId: postOwnerId,
      postOwnerUsername: postOwnerUsername,
      postTitle: postTitle,
      postBody: postBody,
      createdAt: new Date().toISOString(),
    };
    API.graphql(graphqlOperation(createPost, { input }));
    setPostTitle("");
    setPostBody("");
  };

  const currentUserInfo = async () => {
    await Auth.currentUserInfo().then((user) => {
      setPostOwnerId(user.attributes.sub);
      setPostOwnerUsername(user.username);
    });
  };

  return (
    <form className="add-post" onSubmit={handleAddPost}>
      <input
        style={{ font: "19px" }}
        type="text"
        placeholder="Title"
        name="postTitle"
        required
        value={postTitle}
        onChange={handleChangePostTitle}
      />
      <textarea
        name="postBody"
        rows={3}
        cols={40}
        required
        placeholder="New Blog Post"
        value={postBody}
        onChange={handleChangePostBody}
      />
      <input type="submit" className="btn" style={{ fontSize: "19px" }} />
    </form>
  );
};

export default CreatePost;
