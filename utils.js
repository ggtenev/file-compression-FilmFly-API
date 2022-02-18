// const S3 = require("aws-sdk/client/s3");
const fs = require("fs");

// const region = process.env.AWS_REGION;
// const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
// const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY_ID;
// const bucketName = process.env.AWS_BUCKET_NAME;

// const s3 = new S3({
//   region,
//   accessKeyId,
//   secretAccessKey,
//   // bucketName,
// });

/**
 * @description: This function is used to upload [image,pdf,video,audio, file.* ] to the s3 bucket
 * @body { file: base64 string, fileName:string, fileType:string, fileExtension:string (.ext), filePath:string(folder name on s3 on which you want file to be saved) }
 * @returns: {url} url of the uploaded file
 */

// function upload(file) {
//   const fileStream = fs.createReadStream(file.path);

//   const uploadParams = {
//     Bucket: bucketName,
//     Body: fileStream,
//     key: file.fileName,
//   };

//   return s3.uplaod(uploadParams).promise();
// }

// exports.uploadFile = upload;

exports.upload_to_s3 = async ({ fileName, fileLocation }) => {
  try {
    const AWS = require("aws-sdk");
    AWS.config.update({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
      bucketName: process.env.AWS_BUCKET_NAME,
    });
    const s3 = new AWS.S3();
    let data = await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fs.readFileSync(fileLocation),
        // ACL: "public-read",
      })
      .on("httpUploadProgress", (evt) =>
        console.log(
          "Uploaded :: " + parseInt((evt.loaded * 100) / evt.total) + "%"
        )
      )
      .promise();
    return data.Location;
  } catch (ex) {
    console.log(ex.message);
    return "";
  }
};
