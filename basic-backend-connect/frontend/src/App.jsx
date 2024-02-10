import React, { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [jokes, setJokes] = useState([]);

  // we need to define the proxy mean locahost start url in vite config
  useEffect(() => {
    axios
      .get("/api/jokes")
      .then((res) => setJokes(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <h3>Number of jokes {jokes.length}</h3>
      {jokes.map((joke) => (
        <h1>Joke Qs {joke.setup}</h1>
      ))}
    </>
  );
}
