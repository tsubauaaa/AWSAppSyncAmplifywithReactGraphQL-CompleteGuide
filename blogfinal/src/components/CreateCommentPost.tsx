import { API, Auth, graphqlOperation } from "aws-amplify";
import { useEffect, useState } from "react";
import { createComment } from "../graphql/mutations";

interface PROPS {
  postId: string;
}

const CreateCommentPost: React.FC<PROPS> = (props) => {
  const [commentOwnerId, setCommentOwnerId] = useState("");
  const [commentOwnerUsername, setCommentOwnerUsername] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    currentUserInfo();
  }, []);

  const currentUserInfo = async () => {
    await Auth.currentUserInfo().then((user) => {
      setCommentOwnerId(user.attributes.sub);
      setCommentOwnerUsername(user.username);
    });
  };
  const handleAddComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = {
      commentPostId: props.postId,
      commentOwnerId: commentOwnerId,
      commentOwnerUsername: commentOwnerUsername,
      content: content,
      createdAt: new Date().toISOString(),
    };

    await API.graphql(graphqlOperation(createComment, { input }));
    setContent("");
  };

  const handleChangeContent = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
    setContent(event.target.value);

  return (
    <div>
      <form className="add-comment" onSubmit={handleAddComment}>
        <textarea
          name="content"
          value={content}
          rows={3}
          required
          placeholder="Add Your Comment..."
          onChange={handleChangeContent}
        />
        <input
          className="btn"
          type="submit"
          style={{ fontSize: "19px" }}
          value="Add Comment"
        />
      </form>
    </div>
  );
};

export default CreateCommentPost;
