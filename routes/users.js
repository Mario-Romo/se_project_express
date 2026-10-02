const router = require("express").Router();
const { getUsers, createUser, getUser } = require("../controllers/users");

// pay attention to the path here, it is relative to the current file, don't use "/users" because that would look for a users.js file in the root of the project and would not work
router.get("/", getUsers);
router.get("/:userId", getUser);
router.post("/", createUser);

module.exports = router;
