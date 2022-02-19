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
    const { base64, user_id } = req.body;
    let prev = 0;
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `${user_id}.zip`,
      ContentType: "application/zip",
      Body: base64.includes("base64,")
        ? Buffer.from(base64.split("base64,")[1], "base64")
        : base64,
    };
    await s3
      .upload(params, (err, data) => {
        if (err) return res.status(400).json({ message: err.message });
        return res.status(200).json({
          message: "File uploaded successfully",
          success: true,
          url: data.Location,
        });
      })
      .on("httpUploadProgress", function (evt) {
        if (Math.round((evt.loaded * 100) / evt.total) !== prev) {
          console.log(
            `uploading to s3 : ${Math.round((evt.loaded * 100) / evt.total)}%`
          );
          prev = Math.round((evt.loaded * 100) / evt.total);
        }
      });
  } catch (ex) {
    return res.status(500).json({
      message: ex.message,
      success: false,
    });
  }
};

exports.upload_to_s3_v2 = async (req, res, next) => {
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
    const { user_id } = req.body;
    const file_path = path.join(__dirname, `../uploads/${user_id}.zip`);
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `${user_id}.zip`,
      ContentType: "application/zip",
      Body: fs.createReadStream(file_path),
    };
    await s3
      .upload(params, (err, data) => {
        //remove all files in uploads folder but not the folder itself
        fs.readdir(path.join(__dirname, "../uploads"), (err, files) => {
          if (err) throw err;
          for (const file of files) {
            fs.unlink(path.join(__dirname, `../uploads/${file}`), (err) => {
              if (err) throw err;
            });
          }
        });

        if (err) return res.status(400).json({ message: err.message });
        return res.status(200).json({
          message: "File uploaded successfully",
          success: true,
          url: data.Location,
        });
      })
      .on("httpUploadProgress", function (evt) {
        console.log(
          `uploading to s3 : ${Math.round((evt.loaded * 100) / evt.total)}%`
        );
      });
  } catch (ex) {
    return res.status(500).json({
      message: ex.message,
      success: false,
    });
  }
};
