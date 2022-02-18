require("dotenv").config();
const express = require("express");
const cors = require("cors");
const hasApiKey = require("./hasApiKey");
const { upload_to_s3 } = require("./utils");
const server = express();
server.use(cors());

server.use(express.json({ limit: "5000000mb" }));
server.use(express.urlencoded({ limit: "5000000mb" }));
server.use("/upload", hasApiKey, upload_to_s3);

server.get("/health", (req, res) => {
  res.status(200).send("ok");
});
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
