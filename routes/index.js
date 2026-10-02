const router = require("express").Router();
const userRouter = require("./users");
const itemRouter = require("./clothingItems");

// Use the userRouter for all routes starting with /users
router.use("/users", userRouter);
// Use the itemRouter for all routes starting with /items
router.use("/items", itemRouter);

// make sure to export the router, all routes declared here are exported with it
module.exports = router;
