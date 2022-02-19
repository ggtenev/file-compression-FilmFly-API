const JSZip = require("jszip");
const path = require("path");
const fs = require("fs");
module.exports = async (req, res, next) => {
  try {
    console.log("started zip creation");
    console.time("zip");
    const zip = new JSZip();
    const files = req.files;
    files.forEach((file) => {
      file.buffer = fs.readFileSync(file.path);
      zip.file(file.filename, file.buffer);
    });
    const zipFile = await zip.generateAsync({
      type: "nodebuffer",
    });
    req.body.base64 = zipFile;
    fs.readdirSync(path.join(__dirname, "../uploads")).forEach((file) => {
      fs.unlinkSync(path.join(__dirname, "../uploads", file));
    });
    console.log("zip creation took :");
    console.timeEnd("zip");
    next();
  } catch (ex) {
    return res.status(400).json({
      message: ex.message,
    });
  }
};
