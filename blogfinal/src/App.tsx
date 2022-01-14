import "./App.css";
import CreatePost from "./components/CreatePost";
import DisplayPosts from "./components/DisplayPosts";

const App = () => {
  return (
    <div className="App">
      <CreatePost />
      <DisplayPosts />
    </div>
  );
};

export default App;
