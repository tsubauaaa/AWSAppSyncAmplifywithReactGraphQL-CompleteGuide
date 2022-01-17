import { API, graphqlOperation } from "aws-amplify";
import React from "react";
import { deletePost } from "../graphql/mutations";

interface PROPS {
  id: string;
}

const DeletePost: React.FC<PROPS> = (props) => {
  const handleDeletePost = async (postId: string) => {
    const input = {
      id: postId,
    };

    console.log(postId);
    await API.graphql(graphqlOperation(deletePost, { input }));
  };
  return <button onClick={() => handleDeletePost(props.id)}>Delete</button>;
};

export default DeletePost;
