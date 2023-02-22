const jwt = require("jsonwebtoken");

const jwtSecretKey = "#$^9db7df90$#6907bdf23ldnvsd";

export function verifyToken(token) {
  return jwt.verify(token, jwtSecretKey);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(403).json({
      error: "METHOD_NOT_ALLOWED",
      message: `Access denied!`,
    });
    return;
  }
  const authorizationToken = req.headers.authorization;
  if (authorizationToken) {
    try {
      const verifiedUser = verifyToken(authorizationToken);
      console.log("verifiedUser", verifiedUser)

      if (verifiedUser) {

        res.status(200).json({
          payload: verifiedUser,
        });
        return;
      }
    } catch (error) {
     // console.log("error", error);
      // Token has been expired or we detected a fruad attack
      res.status(401).json({
        error: "Unauthorized",
        message: "Not allowed.",
      });
      return;
    }
  }

  // Token has been expired or we detected a fruad attack
  res.status(401).json({
    error: "Unauthorized",
    message: "Not allowed.",
  });
};
