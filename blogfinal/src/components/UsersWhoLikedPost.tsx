import React from "react";

interface PROPS {
  allUsers: string[];
}

const UsersWhoLikedPost: React.FC<PROPS> = (props) => {
  return (
    <>
      {props.allUsers.map((user) => {
        return (
          <div key={user}>
            <span style={{ fontSize: "bold", color: "#ged" }}>{user}</span>
          </div>
        );
      })}
    </>
  );
};

export default UsersWhoLikedPost;
