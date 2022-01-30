const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const JSZip = require("jszip");

const express = require("express");
const multer = require("multer");
const cors = require("cors");

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

(async () => {
  try {
    const images = [];
    // const pdfData = fs.readFileSync(__dirname + "/images/one.png");
    // console.log(pdfData);
    // zip.file("one.png", pdfData);
    // var img = zip.folder("files");
    fs.readdir(__dirname + "/images", (err, files) => {
      if (err) {
        console.log("err");
        return;
      }
      // console.log(files);
      for (const file of files) {
        images.push(`images/${file}`);
        console.log(`images/${file}`);
        const imageData = fs.readFileSync(`images/${file}`);
        zip.file(file, imageData);
      }

      zip
        .generateNodeStream({ type: "nodebuffer", streamFiles: true })
        .pipe(fs.createWriteStream("sample.zip"))
        .on("finish", function () {
          console.log("sample.zip written.");
        });

      // setTimeout(() => {
      //   if (images.length > 0) {
      //     for (const image of images) {
      //       console.log(image);
      //       const imageData = fs.readFileSync(image);
      //       zip.file(image, imageData);
      //     }
      //   }
      // }, 1000);
    });

    const images1 = ["images/comments.png", "images/one.png"];
    const img = zip.folder("images");
  } catch (err) {
    console.error(err);
  }
})();

// Storage Engin That Tells/Configures Multer for where (destination) and how (filename) to save/upload our files
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images"); //important this is a direct path fron our current file to storage location
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + "--" + file.originalname);
  },
});

// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
// output.on("close", function () {
//   console.log(archive.pointer() + " total bytes");
//   console.log(
//     "archiver has been finalized and the output file descriptor has closed."
//   );
// });

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
// output.on("end", function () {
//   console.log("Data has been drained");
// });

// The Multer Middleware that is passed to routes that will receive income requests with file data (multipart/formdata)
// You can create multiple middleware each with a different storage engine config so save different files in different locations on server
const upload = multer({ storage: fileStorageEngine });

// Single File Route Handler
app.post("/single", upload.single("image"), (req, res) => {
  console.log(req.file);
  res.send("Single FIle upload success");
});

// Multiple Files Route Handler
app.post("/multiple", upload.array("images"), (req, res) => {
  console.log(req.files);
  res.send("Multiple Files Upload Success");
});
app.listen(process.env.PORT || 3000);
