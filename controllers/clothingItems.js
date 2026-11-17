const Item = require("../models/clothingItem");
const {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
  VALIDATION_ERROR,
  BAD_REQUEST,
} = require("../utils/errors");

// GET /items - Retrieve all items
const getItems = (req, res) => {
  Item.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// POST /items - Create a new item
const createItem = (req, res) => {
  // destructure the name, weather, and imageUrl fields from the request body
  const { name, weather, imageUrl } = req.body;
  const { _id: owner } = req.user; // destructure the _id field from the user object in the request, and rename it to owner, this will be used to set the owner of the new item
  // ... then pass them to the User.create() method to create a new user in the database
  Item.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// DELETE /items/:itemId - Delete an item by ID
const deleteItem = (req, res) => {
  // destructure the itemId from the request parameters
  const { itemId } = req.params;
  // find the item by ID, and if it exists, check if the owner of the item is the same as the user making the request, if so, delete the item, otherwise return a 403 Forbidden error
  Item.findById(itemId)
    .orFail() // This will throw a DocumentNotFoundError if the item is not found
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        const err = new Error("Forbidden");
        err.statusCode = FORBIDDEN;
        throw err;
      }
      return Item.deleteOne(item);
    })
    .then(() => {
      return res.status(200).send({ message: "Item deleted successfully" });
    })
    .catch((err) => {
      console.error(err); // this gives you info about the error in the console, useful for debugging. Always include it.
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Requested resource not found." });
      }
      if (err.statusCode === FORBIDDEN) {
        return res
          .status(FORBIDDEN)
          .send({ message: "You can only delete your own items." });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// PUT /items/:itemId/likes - Like an item by ID
const likeItem = (req, res) =>
  Item.findByIdAndUpdate(
    req.params.itemId, // destructure the itemId from the request parameters, it will be used to find the item in the database
    { $addToSet: { likes: req.user._id } }, // add _id to the array if it's not there yet
    { new: true }
  )
    .orFail()
    .then((item) =>
      res.status(200).send({ message: "Item liked successfully", item })
    )
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

// DELETE /items/:itemId/likes - Dislike an item by ID
const dislikeItem = (req, res) =>
  Item.findByIdAndUpdate(
    req.params.itemId, // destructure the itemId from the request parameters, it will be used to find the item in the database
    { $pull: { likes: req.user._id } }, // remove _id from the array
    { new: true }
  )
    .orFail()
    .then((item) =>
      res.status(200).send({ message: "Item disliked successfully", item })
    )
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

module.exports = { getItems, createItem, deleteItem, likeItem, dislikeItem };
