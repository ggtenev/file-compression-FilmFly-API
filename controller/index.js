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

    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `${user_id}.zip`,
      ContentType: "application/zip",
      Body: base64.includes("base64,")
        ? Buffer.from(base64.split("base64,")[1], "base64")
        : base64,
    };
    let data = await s3.upload(params).promise();
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
