const jwt = require("jsonwebtoken");
const { UNAUTHORIZED } = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const auth = (req, res, next) => {
  const { authorization } = req.headers; // get the authorization from the header
  // check if the header exists and starts with "Bearer "
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(UNAUTHORIZED).send({ message: "Authorization required" });
  }
  const token = authorization.replace("Bearer ", ""); // get the token from the header, remove the "Bearer " part by doing this, only the JWT will be in the token constant that we created.
  let payload; // initialize payload var before the try-catch block, so that it can be used outside of the block if needed

  try {
    payload = jwt.verify(token, JWT_SECRET); // verify the token using jwt.verify()
  } catch (err) {
    return res.status(UNAUTHORIZED).send({ message: "Authorization required" }); // we return an error if something goes wrong
  }
  req.user = payload; // if the token is valid, assign the payload to the request object, so that it can be used in the next middleware or route handler
  return next(); // send the request to the next middleware
};

module.exports = auth;
