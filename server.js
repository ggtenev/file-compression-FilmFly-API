require("dotenv").config();
const express = require("express");
const cors = require("cors");
const hasApiKey = require("./middleware/hasApiKey");
const { upload_to_s3 } = require("./controller");
const createZip = require("./middleware/createZip");
const server = express();
const multer = require("multer");
server.use(cors());

server.use(express.json({ limit: "5000000mb" }));
server.use(express.urlencoded({ limit: "5000000mb" }));

const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads/",
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

server.post("/v1/upload", hasApiKey, upload_to_s3);
server.post(
  "/v2/upload",
  [hasApiKey, upload.array("images"), createZip, upload_to_s3],
  upload_to_s3
);

server.get("/health", (req, res) => {
  res.status(200).send("ok");
});
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
