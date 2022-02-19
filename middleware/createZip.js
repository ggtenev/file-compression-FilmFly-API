const JSZip = require("jszip");
const path = require("path");
const fs = require("fs");
module.exports = async (req, res, next) => {
  try {
    console.log("started zip creation");
    console.time("zipDone");
    const zip = new JSZip();
    if (!req.files) {
      return res.status(400).json({
        message: "No files found",
      });
    }
    const files = req.files;
    console.log({
      files,
    });
    files.forEach((file) => {
      file.buffer = fs.readFileSync(file.path);
      zip.file(file.filename, file.buffer);
    });
    const zipFile = zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(
        fs.createWriteStream(
          path.join(__dirname, `../uploads/${req.body.user_id}.zip`)
        )
      );
    zipFile.on("finish", () => {
      console.timeEnd("zipDone");
      console.log("zip created");
      next();
    });
  } catch (ex) {
    return res.status(400).json({
      message: ex.message,
    });
  }
};
