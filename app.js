const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");

const app = express();
const { PORT = 3001 } = process.env;

// Connect to MongoDB, uses promises to log success or error messages to the console (upgrade)
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(console.error);
// middleware to parse JSON bodies from incoming requests, is important to call this before defining any routes that expect JSON data in the request body, otherwise the request body will be undefined
app.use(express.json());
// middleware to simulate authentication by adding a user object to the request,it is important to notice the location of this middleware, it should be placed BEFORE the mainRouter to ensure that the user object is available in all routes
app.use((req, res, next) => {
  req.user = {
    _id: "6ab4b228d292b9d1c7d483f7"
  };
  next();
});
// mounts mainRouter at "/" binding all routes declared in mainRouter to the root path of the application
app.use("/", mainRouter);


app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
