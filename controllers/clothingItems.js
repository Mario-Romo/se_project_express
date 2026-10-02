const Item = require("../models/clothingItem");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
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
  // destructure the name and avatar fields from the request body
  const { name, weather, imageUrl } = req.body;
  const { _id: owner } = req.user;
  // ... then pass them to the User.create() method to create a new user in the database
  Item.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
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
  // ... then pass it to the User.findByIdAndDelete() method to delete the item from the database
  Item.findByIdAndDelete(itemId)
    .orFail() // This will throw a DocumentNotFoundError if the item is not found
    .then((item) =>
      res.status(200).send({ message: "Item deleted successfully", item })
    )
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Requested resource not found." });
      } if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// PUT /items/:itemId/likes - Like an item by ID
const likeItem =  (req, res) => Item.findByIdAndUpdate (
  req.params.itemId, // destructure the itemId from the request parameters, it will be used to find the item in the database
  { $addToSet: { likes: req.user._id }}, //add _id to the array if it's not there yet
  { new: true },
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
      } if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });


// DELETE /items/:itemId/likes - Dislike an item by ID
const dislikeItem = (req, res) => Item.findByIdAndUpdate (
  req.params.itemId, // destructure the itemId from the request parameters, it will be used to find the item in the database
  { $pull: { likes: req.user._id }}, //remove _id from the array
  { new: true },
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
      } if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });


module.exports = { getItems, createItem, deleteItem, likeItem, dislikeItem  };
