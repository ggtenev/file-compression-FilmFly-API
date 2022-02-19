const path = require("path");
const fs = require("fs");
exports.upload_to_s3 = async (req, res, next) => {
  try {
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
    const s3 = new AWS.S3();
    const { user_id, file_path } = req.body;
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
      url: data.Location,
    });
  } catch (ex) {
    return res.status(500).json({
      message: ex.message,
      success: false,
    });
  }
};
