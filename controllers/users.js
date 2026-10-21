const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");
const bcryptjs = require("bcryptjs");

// GET /users - Retrieve all users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// GET /users/:userId - Retrieve a user by ID
const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail() // This will throw a DocumentNotFoundError if the user is not found
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Requested resource not found." });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};


// POST /users - Create a new user
const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  bcryptjs.hash(password, 10)
    .then((hashedPassword) =>
      User.create({ name, avatar, email, password: hashedPassword }))
        .then((user) => res.status(201).send(user))
        .catch((err) => {
        console.error(err); // this gives you info about the error in the console, useful for debugging. Always include it.
          if (err.name === "ValidationError") {
          return res
          .status(BAD_REQUEST)
          .send({ message: "Requested resource not found" });
        }
        return res
          .status(INTERNAL_SERVER_ERROR)
          .send({ message: "An error has occurred on the server." });
      })

  // catch any errors that occur during the hashing process
  .catch((err) => {
    console.error(err);
    return res
      .status(409)
      .send({ message: "An error has occurred on the server." });
  });
};

module.exports = { getUsers, createUser, getUser };
