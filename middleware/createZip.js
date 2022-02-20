const JSZip = require("jszip");
const path = require("path");
const fs = require("fs");
module.exports = async (req, res, next) => {
  try {
    console.log("started zip creation");
    console.time("zipDone");
    const zip = new JSZip();
    if (!req?.files?.length) {
      return res.status(400).json({
        message: "No files found",
      });
    }
    if (!req?.body?.user_id) {
      return res.status(400).json({
        message: "user_id is required",
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
    let file_path = path.join(__dirname, `../uploads/${Date.now()}.zip`);
    const zipFile = zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(fs.createWriteStream(file_path));
    zipFile.on("finish", () => {
      console.timeEnd("zipDone");
      console.log("zip created");
      req.body.file_path = file_path;
      next();
    });
  } catch (ex) {
    return res.status(400).json({
      message: ex.message,
    });
  }
};
