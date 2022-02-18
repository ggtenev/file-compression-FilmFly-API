// // const S3 = require("aws-sdk/client/s3");
// const fs = require("fs");

// // const region = process.env.AWS_REGION;
// // const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
// // const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY_ID;
// // const bucketName = process.env.AWS_BUCKET_NAME;

// // const s3 = new S3({
// //   region,
// //   accessKeyId,
// //   secretAccessKey,
// //   // bucketName,
// // });

// /**
//  * @description: This function is used to upload [image,pdf,video,audio, file.* ] to the s3 bucket
//  * @body { file: base64 string, fileName:string, fileType:string, fileExtension:string (.ext), filePath:string(folder name on s3 on which you want file to be saved) }
//  * @returns: {url} url of the uploaded file
//  */

// // function upload(file) {
// //   const fileStream = fs.createReadStream(file.path);

// //   const uploadParams = {
// //     Bucket: bucketName,
// //     Body: fileStream,
// //     key: file.fileName,
// //   };

// //   return s3.uplaod(uploadParams).promise();
// // }

// // exports.uploadFile = upload;

// exports.upload_to_s3 = async ({ fileName, fileLocation }) => {
//   try {
//     const AWS = require("aws-sdk");
//     AWS.config.update({
//       region: process.env.AWS_REGION,
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
//       bucketName: process.env.AWS_BUCKET_NAME,
//     });
//     const s3 = new AWS.S3();
//     let data = await s3
//       .upload({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: fileName,
//         Body: fs.readFileSync(fileLocation),
//         // ACL: "public-read",
//       })
//       .on("httpUploadProgress", (evt) =>
//         console.log(
//           "Uploaded :: " + parseInt((evt.loaded * 100) / evt.total) + "%"
//         )
//       )
//       .promise();
//     return data.Location;
//   } catch (ex) {
//     console.log(ex.message);
//     return "";
//   }
// };

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
      // ACL: "public-read",
      // eslint-disable-next-line no-undef
      Body: Buffer.from(base64.split("base64,")[1], "base64"),
    };
    let data = await s3.upload(params).promise();
    return res.status(200).json({
      message: "File uploaded successfully",
      success: true,
      url: data.Location,
    });
  } catch (ex) {
    console.log({
      ex,
    });
    return res.status(500).json({
      message: ex.message,
      success: false,
    });
  }
};
