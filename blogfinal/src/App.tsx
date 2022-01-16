import "./App.css";
import CreatePost from "./components/CreatePost";
import DisplayPosts from "./components/DisplayPosts";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Auth } from "aws-amplify";

const signOut = async () => {
  await Auth.signOut();
  document.location.reload();
};

const App = () => {
  return (
    <div className="App">
      <button onClick={signOut}>Sign Out</button>
      <CreatePost />
      <DisplayPosts />
    </div>
  );
};

//@ts-ignore
export default withAuthenticator(App);
