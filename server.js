require("dotenv").config();
const express = require("express");
const cors = require("cors");
const hasApiKey = require("./middleware/hasApiKey");
const { upload_to_s3_v2 } = require("./controller");
const createZip = require("./middleware/createZip");
const server = express();
const multer = require("multer");
server.use(cors());

server.use(express.json({ limit: Infinity }));
server.use(express.urlencoded({ limit: Infinity }));

const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads/",
    filename: function (req, file, cb) {
      console.log({ file });
      cb(null, file.originalname);
    },
  }),
});

/**
 *  This Api is used to upload files to S3 bucket,this api compressess the
 *  uploaded files creates a zip from them , You need to send files as a
 *  formdata along with user_id and api_key in the authroization header.
 */
server.post(
  "/v1/upload",
  [hasApiKey, upload.array("images"), createZip],
  upload_to_s3
);
server.get("/health", (req, res) => {
  res.status(200).send("ok");
});
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
