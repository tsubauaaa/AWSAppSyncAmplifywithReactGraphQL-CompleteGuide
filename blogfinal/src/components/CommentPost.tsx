import React from "react";

interface PROPS {
  commentOwnerUsername: string;
  createdAt: string;
  content: string;
}

const CommentPost: React.FC<PROPS> = (props) => {
  return (
    <div>
      <span style={{ fontStyle: "italic", color: "#0ca5e297" }}>
        {"Comment by: "} {props.commentOwnerUsername}
        {" on "}
        <time style={{ fontStyle: "italic" }}>
          {" "}
          {new Date(props.createdAt).toLocaleDateString()}
        </time>
      </span>
      <p>{props.content}</p>
    </div>
  );
};
export default CommentPost;
