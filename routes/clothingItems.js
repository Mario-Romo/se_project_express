const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

// pay attention to the paths here, each is relative to the current file, don't use "/users" because that would look for a users.js file in the root of the project and would not work
router.get("/", getItems);
router.post("/", createItem);
router.delete("/:itemId", deleteItem);
// these two routes are for liking and disliking a clothing item
router.put("/:itemId/likes", likeItem);
router.delete("/:itemId/likes", dislikeItem);

module.exports = router;
