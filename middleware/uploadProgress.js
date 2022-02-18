module.exports = async (req, res, next) => {
  next();
  let progress = 0;
  let fileSize = req.headers["content-length"]
    ? parseInt(req.headers["content-length"])
    : 0;
  req.on("data", (chunk) => {
    progress += chunk.length;
    res.write(`${Math.floor((progress * 100) / fileSize)} `);
    console.log({
      uploadding: `${Math.floor((progress * 100) / fileSize)} `,
    });
  });
};
