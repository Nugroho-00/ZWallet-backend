require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const app = express();
const jsonParser = express.json();

// use express app
app.use(express.urlencoded({ extended: false }));
app.use(jsonParser);
app.use(logger("dev"));
app.use(cors());
app.use(express.static("public"));

// // import middlewares
// const { authentication } = require("./src/middlewares/authentication");

// import route
const authRoute = require("./src/routes/authRoutes");
const usersRoute = require("./src/routes/usersRoutes");
const transactionRoute = require("./src/routes/transactionRoutes");

// route acces
app.use("/auth", authRoute);
app.use("/profile", usersRoute);
app.use("/transaction", transactionRoute);

// temporary route
// app.use("/notification");

app.listen(process.env.PORT, () => {
  console.log("Server running at port", process.env.PORT);
});

// Test Connection
app.get("/", (req, res) => {
  res.json({
    succes: true,
    message: "Backend is Running Now!!!",
  });
});
