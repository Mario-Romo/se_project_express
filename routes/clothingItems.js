const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const auth = require("../middlewares/auth");

// pay attention to the paths here, each is relative to the current file, don't use "/users" because that would look for a users.js file in the root of the project and would not work
router.get("/", getItems);

router.use(auth); // apply the auth middleware to all routes in this router, this will ensure that only authenticated users can access these routes
// these two routes are for liking and disliking a clothing item and they require auth
router.put("/:itemId/likes", likeItem);
router.delete("/:itemId/likes", dislikeItem);

router.post("/", createItem);
router.delete("/:itemId", deleteItem);


module.exports = router;
