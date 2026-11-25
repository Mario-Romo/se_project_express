// first import external packages
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
// then import internal modules
const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  CONFLICT,
} = require("../utils/errors");

const { JWT_SECRET } = require("../utils/config");

// GET /users - Retrieve all users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err); // this gives you info about the error in the console, useful for debugging. Always include it.
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// GET /users/me - Find the current user based on the JWT token provided in the request headers, and return the user data in the response
const getCurrentUser = (req, res) => {
  const { _id: userId } = req.user;
  User.findById(userId)
    .orFail() // This will throw a DocumentNotFoundError if the user is not found
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err); // this gives you info about the error in the console, useful for debugging. Always include it.
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Requested resource not found." });
      }
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({
          message: "Data validation failed or another error occured.",
        });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({
          message: "Data validation failed or another error occured.",
        });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// PATCH /users/me - update profile
const updateCurrentUser = (req, res) => {
  const { _id: userId } = req.user;
  const { name, avatar } = req.body; // destructure the name and avatar fields from the request body
  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true } // return the updated document and run validators on the update
  )
    .orFail() // This will throw a DocumentNotFoundError if the user is not found
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err); // this gives you info about the error in the console, useful for debugging. Always include it.
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Requested resource not found." });
      }
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({
          message: "Data validation failed or another error occured.",
        });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({
          message: "Data validation failed or another error occured.",
        });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// POST /login - login controller, authenticates a user and returns a JWT token
const login = (req, res) => {
  // Check if there is no email or password in request body
  const { email, password } = req.body;
  // If either email or password is missing, return a 400 Bad Request response with an error message
  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and password are required" });
  }

  // use finduserbycredentials static method to find the user by email and password
  return (
    User.findUserByCredentials(email, password)
      .then((user) => {
        // authentication successful, user is in the user variable, now generate a JWT token using the user's _id and the secret key, and set an expiration time for the token
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });
        // Send the token in the response
        return res.send({ token });
      })
      // if not send an error response with a 401 Unauthorized status code and an error message
      .catch((err) => {
        console.error(err); // this gives you info about the error in the console, useful for debugging. Always include it.
        if (err.message === "Incorrect email or password") {
          return res.status(UNAUTHORIZED).send({
            message: "Incorrect email or password",
          });
        }
        return res
          .status(INTERNAL_SERVER_ERROR)
          .send({ message: "An error has occurred on the server." });
      })
  );
};

// POST /signup - Create a new user
const createUser = (req, res) => {
  // destructure the name, avatar, email, and password fields from the request body
  const { name, avatar, email, password } = req.body;
  // Check if there is no email or password in request body
  if (!email || !password || !name || !avatar) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email, name, avatar, and password are required" });
  }
  // before creating the user, hash the password using bcryptjs and then pass the hashed password to the User.create() method to create a new user in the database
  return (
    bcryptjs
      .hash(password, 10)
      .then((hashedPassword) =>
        User.create({ name, avatar, email, password: hashedPassword })
      )
      .then((user) => {
        const userObj = user.toJSON(); // convert the user document to a plain JavaScript object, notice it needs a different variable name than the user document itself, otherwise it will throw an error
        delete userObj.password; // ...and remove the password field before sending the response
        return res.status(201).send(userObj);
      })
      // this catch block will handle any errors that occur during the user creation process, including validation errors and server errors
      .catch((err) => {
        console.error(err); // this gives you info about the error in the console, useful for debugging. Always include it.
        if (err.name === "ValidationError") {
          return res.status(BAD_REQUEST).send({
            message: "Data validation failed or another error occured.",
          });
        }
        if (err.code === 11000) {
          return res
            .status(CONFLICT)
            .send({ message: "Conflict: User already exists" });
        }
        return res
          .status(INTERNAL_SERVER_ERROR)
          .send({ message: "An error has occurred on the server." });
      })
  );
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
