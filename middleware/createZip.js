const JSZip = require("jszip");
const path = require("path");
const fs = require("fs");
module.exports = async (req, res, next) => {
  try {
    const zip = new JSZip();
    const files = req.files;
    const folder = path.join(__dirname, "../uploads", req.body.user_id);
    fs.mkdirSync(folder, { recursive: true });
    files.forEach((file) => {
      file.buffer = fs.readFileSync(file.path);
      const filePath = path.join(folder, file.filename);
      fs.writeFileSync(filePath, file.buffer);
      zip.file(file.filename, file.buffer);
    });
    const zipFile = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });
    req.body.base64 = zipFile;
    fs.readdirSync(folder).forEach((file) => {
      fs.unlinkSync(path.join(folder, file));
    });
    fs.rmdirSync(folder);
    next();
  } catch (ex) {
    return res.status(400).json({
      message: ex.message,
    });
  }
};
