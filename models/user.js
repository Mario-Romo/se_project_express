const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "You must enter a valid URL",
    },
  },
  email: {
    type: String,
    required: [true, "The email field is required."],
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: "You must enter a valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "The password field is required."],
    select: false, // This ensures that the password field is not returned in queries by default
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  // trying to find the user by email
  return this.findOne({ email })
    .select("+password") // explicitly selecting the password field since it is not selected by default, without this, the password field will be undefined and the comparison will always fail
    .then((user) => {
      // not found - rejecting the promise
      if (!user) {
        return Promise.reject(new Error("Incorrect email or password"));
      }
      // found - comparing hashes
      return bcryptjs.compare(password, user.password).then((matched) => {
        if (!matched) {
          // if the password does not match, reject the promise (this is the correct way of rejecting this promise otherwise user would be returned even if the password is incorrect)
          return Promise.reject(new Error("Incorrect email or password"));
        }
        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
