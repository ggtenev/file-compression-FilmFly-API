const JSZip = require("jszip");
const path = require("path");
const fs = require("fs");
module.exports = async (req, res, next) => {
  try {
    const zip = new JSZip();
    const files = req.files;
    files.forEach((file) => {
      file.buffer = fs.readFileSync(file.path);
      zip.file(file.filename, file.buffer);
    });
    console.log("creating zip ...");
    const zipFile = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });
    console.log("zip created...");
    req.body.base64 = zipFile;
    fs.readdirSync(path.join(__dirname, "../uploads")).forEach((file) => {
      fs.unlinkSync(path.join(__dirname, "../uploads", file));
    });
    next();
  } catch (ex) {
    return res.status(400).json({
      message: ex.message,
    });
  }
};
