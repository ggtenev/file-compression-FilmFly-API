module.exports = async (req, res, next) => {
  next();
  let progress = 0;
  let prevProgress = 0;
  let fileSize = req.headers["content-length"]
    ? parseInt(req.headers["content-length"])
    : 0;
  req.on("data", (chunk) => {
    progress += chunk.length;
    if (
      `${Math.floor((progress * 100) / fileSize)}%` !==
      `${Math.floor((prevProgress * 100) / fileSize)}%`
    ) {
      console.log({
        uploaded: `${Math.floor((progress * 100) / fileSize)}%`,
      });
      prevProgress = progress;
    }
  });
};
