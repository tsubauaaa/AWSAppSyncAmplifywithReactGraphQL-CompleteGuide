import React from "react";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { useEffect, useState } from "react";
import { updatePost } from "../graphql/mutations";

interface PROPS {
  id: string;
  postTitle: string;
  postBody: string;
}

const EditPost: React.FC<PROPS> = (props) => {
  const [show, setShow] = useState(false);
  const [id, setId] = useState("");
  const [postOwnerId, setPostOwnerId] = useState("");
  const [postOwnerUsername, setPostOwnerUsername] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postData, setPostData] = useState({
    postTitle: props.postTitle,
    postBody: props.postBody,
  });

  useEffect(() => {
    currentUserInfo();
  }, []);

  const currentUserInfo = async () => {
    await Auth.currentUserInfo().then((user) => {
      setPostOwnerId(user.attributes.sub);
      setPostOwnerUsername(user.username);
    });
  };

  const handleModel = () => {
    setShow(!show);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const handleUpdatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = {
      id: props.id,
      postOwnerId: postOwnerId,
      postOwnerUsername: postOwnerUsername,
      postTitle: postData.postTitle,
      postBody: postData.postBody,
    };

    await API.graphql(graphqlOperation(updatePost, { input }));

    setShow(!show);
  };

  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostData((prev) => ({
      ...prev,
      postTitle: event.target.value,
    }));
  };

  const handleBody = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostData((prev) => ({ ...prev, postBody: event.target.value }));
  };

  return (
    <>
      {show && (
        <div className="modal">
          <button className="close" onClick={handleModel}>
            X
          </button>
          <form
            className="add-post"
            onSubmit={(event) => handleUpdatePost(event)}
          >
            <input
              style={{ fontSize: "19px" }}
              type="text"
              placeholder="Title"
              name="postTitle"
              value={postData.postTitle}
              onChange={handleTitle}
            />

            <input
              style={{ height: "150px", fontSize: "19px" }}
              type="text"
              name="postBody"
              value={postData.postBody}
              onChange={handleBody}
            />
            <button>Update Post</button>
          </form>
        </div>
      )}
      <button onClick={() => handleModel()}>Edit</button>
    </>
  );
};

export default EditPost;
