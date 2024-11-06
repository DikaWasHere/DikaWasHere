const express = require("express");
const app = express();
const PORT = 3000;
const routes = require("./routes");

app.use("/images", express.static("public/images"));
app.use("/videos", express.static("public/videos"));

app.use("/", routes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`I LOVE YOU ${PORT}`);
});
