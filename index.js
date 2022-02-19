const path = require("path");
const fs = require("fs");
require("dotenv").config();

const JSZip = require("jszip");

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { upload_to_s3 } = require("./utils");
const template = require("./template");

const app = express();
var zip = new JSZip();

// This middleware is used to enable Cross Origin Resource Sharing This sets Headers to allow access to our client application
app.use(cors());

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      console.log("CANNOT RAD FILE");
      return;
    }
    filenames.forEach(function (filename) {
      fs.readFile(dirname + filename, "utf-8", function (err, content) {
        if (err) {
          console.log("CANNOT RAD FILE");
          return;
        }
        img.file(filename, content);
      });
    });
  });
}

const createZip = async (req, res, next) => {
  try {
    const images = [];
    // const pdfData = fs.readFileSync(__dirname + "/images/one.png");
    // console.log(pdfData);
    // zip.file("one.png", pdfData);
    // var img = zip.folder("files");

    fs.readdir(__dirname + `/${req.params.id}`, async (err, files) => {
      if (err) {
        console.log("err");
        return;
      }
      // console.log(files);
      for (const file of files) {
        images.push(`${req.params.id}/${file}`);
        console.log(`${req.params.id}/${file}`);
        const imageData = fs.readFileSync(`${req.params.id}/${file}`);
        zip.file(file, imageData);
      }
      let base64 = fs.readFileSync(`${req.params.id}.zip`, "base64");
      zip
        .generateNodeStream({ type: "nodebuffer", streamFiles: true })
        .pipe(fs.createWriteStream(`${req.params.id}.zip`))
        .on("finish", async function () {
          for (const file of files) {
            fs.unlink(`${req.params.id}/${file}`, (err) => {
              if (err) {
                console.log("err");
              }
            });
          }
          console.log("sample.zip written.");
          fs.rmdir(__dirname + `/${req.params.id}`, () => {
            console.log("Folder Deleted!");
          });

          try {
            upload_to_s3({
              fileName: `${req.params.id + Math.random(5).toString()}.zip`,
              fileLocation: `${__dirname}/${req.params.id}.zip`,
            }).then((url) => {
              console.log(url);
              fs.unlinkSync(`${__dirname}/${req.params.id}.zip`);
              res.status(200).json({ url });
            });

            // fs.unlink(`${__dirname}/${req.params.id}.zip`, (err) => {
            //   if (err) console.log(err);
            //   else {
            //     console.log("\nDeleted file: example_file.txt");

            //   }
            // });
            // return res.status(200).send(
            //   template({
            //     link: url,
            //     image:
            //       "data:image/jpeg;base64," +
            //       fs.readFileSync("./backgroun-image.jpeg", "base64"),
            //     fileName: `${req.params.id}.zip`,
            //   })
            // );
          } catch (ex) {
            return res.status(400).json({ message: ex.message });
          }
        });
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }

  // next();
};

// Storage Engin That Tells/Configures Multer for where (destination) and how (filename) to save/upload our files
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./${req.params.id}`); //important this is a direct path fron our current file to storage location
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + "--" + file.originalname);
  },
});

const createUserDirectory = (req, res, next) => {
  fs.mkdir(path.join(__dirname, req.params.id), (err) => {
    if (err) {
      return console.error(err);
    }
    console.log("Directory created successfully!");
  });
  next();
};

// The Multer Middleware that is passed to routes that will receive income requests with file data (multipart/formdata)
// You can create multiple middleware each with a different storage engine config so save different files in different locations on server
const upload = multer({ storage: fileStorageEngine });

// Single File Route Handler
app.post("/single/:id", upload.single("image"), (req, res) => {
  // console.log(req.file);
  res.send("Single FIle upload success");
});

// Multiple Files Route Handler
app.post(
  "/multiple/:id",
  createUserDirectory,
  upload.array("images"),
  createZip
);

app.get("/test", (req, res) => {
  console.log("test");
  res.send("Working");
});
app.listen(process.env.PORT || 8080, () =>
  console.log("listening 8081", process.env.PORT)
);
//cron job to delete the zip file after 7 day from s3
