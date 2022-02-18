//middleware to check if the user has the api key in req.headers.authorization

module.exports = (req, res, next) => {
  try {
    let { authorization = "" } = req.headers;
    console.log({ authorization, x: req.headers });
    authorization = authorization.split(" ")[1];
    if (!authorization) {
      return res.status(401).send("Unauthorized");
    }
    if (authorization !== process.env.API_KEY) {
      return res.status(401).send("Unauthorized");
    }
    console.log({
      api: process.env.API_KEY,
    });
    next();
  } catch (ex) {
    console.log({
      message: ex,
    });
    return res.status(401).json({
      message: ex.message,
    });
  }
};
