require("dotenv").config();
const express = require("express");
const app = express();

// const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/halwa", (req, res) => {
  res.send("this is the page for buying halwa");
});

app.get("/node", (req, res) => {
  res.send(`<h1>This is the page to learn node</h1>

  <a herf="https://nodejs.org>visit nodejs</a>
  `);
});

app.get("/react", (req, res) => {
  res.send(`<a href="https://react.dev" target="_blank">Visit react.dev</a>
  `);
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
