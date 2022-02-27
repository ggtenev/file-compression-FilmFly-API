const path = require("path");
const fs = require("fs");

const AWS = require("aws-sdk");
const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_BUCKET_NAME,
} = process.env;
AWS.config.update({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY_ID,
  Bucket: AWS_BUCKET_NAME,
});
exports.upload_to_s3 = async (req, res, next) => {
  try {
    const s3 = new AWS.S3();
    const { user_id, file_path } = req.body;
    const KEY = `${user_id}/${Date.now()}.zip`;
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `${user_id}/${Date.now()}.zip`,
      ContentType: "application/zip",
      Body: fs.createReadStream(file_path),
    };
    console.log("started uploading to s3");
    let data = await s3.upload(params).promise();
    fs.readdir(path.join(__dirname, "../uploads"), (err, files) => {
      if (err) throw err;
      for (const file of files) {
        fs.unlink(path.join(__dirname, `../uploads/${file}`), (err) => {
          if (err) throw err;
        });
      }
    });
    console.log("uploaded to s3 : ", data.Location);
    return res.status(200).json({
      message: "File uploaded successfully",
      success: true,

      url: `http://54.193.197.90:8080/v1/get-file/${String(KEY)
        .split("/")
        .join("__")}`,
    });
  } catch (ex) {
    return res.status(500).json({
      message: ex.message,
      success: false,
    });
  }
};
exports.downloadZip = async (req, res, next) => {
  const { file_path } = req.params;
  const [folder, file] = file_path.split("__");
  const s3 = new AWS.S3();
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: `${folder}/${file}`,
  };
  //stream the file to user , after its done delete the file from s3
  let download = s3.getObject(params).createReadStream();
  download.on("error", (err) => {
    console.log(err);
  });
  download.on("end", () => {
    s3.deleteObject(params, (err, data) => {
      if (err) console.log({ error: err });
      console.log("deleted from s3");
    });
  });
  res.setHeader("Content-disposition", `attachment; filename=${file}`);
  return download.pipe(res);
};
