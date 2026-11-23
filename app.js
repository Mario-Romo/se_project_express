// import external packages first
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// import internal modules next
const mainRouter = require("./routes/index");

const app = express();
app.use(cors()); // make sure this runs before express.json() and before mainRouter is mounted, otherwise the CORS headers will not be applied to the responses from the routes defined in mainRouter
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
// mounts mainRouter at "/" binding all routes declared in mainRouter to the root path of the application
app.use("/", mainRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
