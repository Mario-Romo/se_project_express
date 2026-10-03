const router = require("express").Router();
const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const { NOT_FOUND } = require("../utils/errors");

// Use the userRouter for all routes starting with /users
router.use("/users", userRouter);
// Use the itemRouter for all routes starting with /items
router.use("/items", itemRouter);

// catch-all route for any undefined routes, returns a 404 error with a message. Important: place this route at the end of the router, after all other routes have been defined, so that it only catches requests that do not match any of the defined routes.
router.use((req, res) =>
  res.status(NOT_FOUND).send({ message: "Requested resource not found" })
);

// make sure to export the router, all routes declared here are exported with it
module.exports = router;
