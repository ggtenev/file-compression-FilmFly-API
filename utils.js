/**
 * @description: This function is used to upload [image,pdf,video,audio, file.* ] to the s3 bucket
 * @body { file: base64 string, fileName:string, fileType:string, fileExtension:string (.ext), filePath:string(folder name on s3 on which you want file to be saved) }
 * @returns: {url} url of the uploaded file
 */
exports.upload_to_s3 = async ({ fileName, fileLocation }) => {
  const AWS = require("aws-sdk");
  AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_ID,
    Bucket: "BUCKET_NAME",
  });
  const s3 = new AWS.S3();
  let data = await s3
    .upload({
      Bucket: "BUCKET_NAME",
      Key: fileName,
      Body: fs.readFileSync(fileLocation),
      ACL: "public-read",
    })
    .promise();
  return data.Location;
};
