import express from "express";

const app = express();
const port = process.env.PORT || 3000;

const jokesArray = [
  {
    setup: "Why did the JavaScript developer go broke?",
    punchline: "Because he lost all his cache!",
  },
  {
    setup: "How do you comfort a JavaScript bug?",
    punchline: "You console it!",
  },
  {
    setup: "Why did the function go to therapy?",
    punchline: "It had too many issues to resolve!",
  },
  {
    setup: "What did the server say to the client?",
    punchline: "I'm sorry, I didn't catch that error!",
  },
  {
    setup: "How does a developer break the ice at parties?",
    punchline: "They tell a good algorithm!",
  },
  {
    setup: "Why do programmers prefer dark mode?",
    punchline: "Because light attracts bugs!",
  },
  {
    setup: "What's a developer's favorite drink?",
    punchline: "Java!",
  },
];

// standrad for writing apis
app.get("/api/jokes", (req, res) => res.json(jokesArray));

app.listen(port, () => console.log(`server is running at port ${port}`));
