import axios from "axios";

function App() {
  const handleClick = async () => {
    const response = await axios.get("http://localhost:3000/auth/google");
    window.open(response.data.url, "_self");
  };
  return (
    <div>
      <button onClick={handleClick}>click me</button>
    </div>
  );
}

export default App;
