import jwt from "jsonwebtoken";

export default (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "my_secret_key");
    req.userData = decoded;
    console.log("CHECK SUCCESSFUL: Your token: " + token);
    next();
  } catch (error) {
    // 401: unauthenticated
    return res.status(401).json({
      message: "Auth failed ha ha"
    });
  }
};
