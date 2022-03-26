const path = require("path");
const fs = require("fs");
const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyCPOhhhv7JtWtt9zIzX2sY-OeGaYI3IzBM",
  authDomain: "film-fly-e6c68.firebaseapp.com",
  projectId: "film-fly-e6c68",
  storageBucket: "film-fly-e6c68.appspot.com",
  messagingSenderId: "272978874372",
  appId: "1:272978874372:web:1d4ccd48729affc9dca551",
  measurementId: "G-1NDJJ63H5M",
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  +firebase
    .firestore()
    .settings({ experimentalForceLongPolling: true, merge: true });
}

firebase.firestore();
firebase.storage();

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
  try {
    const file_path = req.params.file_path;
    const [folder, file] = file_path.split("__");

    let link = `http://54.193.197.90:8080/v1/get-file/${file_path}`;
    let user_link = await firebase
      .firestore()
      .collection("users")
      .doc(folder)
      .get();
    if (!user_link.exists) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    let user_links = user_link.data().links;
    let is_link_exists = false;

    user_links.forEach(({ url }) => {
      if (url === link) {
        is_link_exists = true;
      }
    });

    if (!is_link_exists) {
      return res.status(404).json({
        message: "Link not found",
        success: false,
      });
    }

    const s3 = new AWS.S3();
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `${folder}/${file}`,
    };
    let download = s3.getObject(params).createReadStream();
    download.on("error", (err) => {
      return res.status(500).json({
        message: err.message,
        success: false,
      });
    });
    download.on("end", async () => {
      await firebase
        .firestore()
        .collection("users")
        .doc(folder)
        .get()
        .then(async (data) => {
          await firebase
            .firestore()
            .collection("users")
            .doc(folder)
            .update({
              links: data
                .data()
                .links.filter(
                  (link) =>
                    link.url !==
                    `http://54.193.197.90:8080/v1/get-file/${file_path}`
                ),
            });
        });
      console.log("Download Finished");
    });
    res.setHeader("Content-disposition", `attachment; filename=${file}`);
    return download.pipe(res);
  } catch (ex) {
    return res.status(500).json({
      message: ex.message,
      success: false,
    });
  }
};
