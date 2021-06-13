require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const app = express();
const jsonParser = express.json();

const http = require("http");
const socketIO = require("socket.io");

const server = http.createServer(app);

// use express app
app.use(express.urlencoded({ extended: false }));
app.use(jsonParser);
app.use(logger("dev"));
app.use(cors());
app.use(express.static("public"));

const io = socketIO(server, {
  cors: {
    origin: "*",
    method: ["GET", "POST", "PATCH", "DELETE"]
  }
});

// import route
const authRoute = require("./src/routes/authRoutes");
const usersRoute = require("./src/routes/usersRoutes");
const transactionRoute = require("./src/routes/transactionRoutes");
const notificationRoute = require("./src/routes/notificationRouters");
const extRoute = require("./src/routes/extRoutes");

// route acces
app.use("/auth", authRoute);
app.use("/profile", usersRoute);
app.use("/transaction", transactionRoute);

// extra route
app.use("/ext", extRoute);
app.use("/notification", notificationRoute);

io.on("connection", (socket) => {
  console.log(`${socket.id} has joined`);
});

server.listen(process.env.PORT, () => {
  console.log("Server running at port", process.env.PORT);
});

// Test Connection
app.get("/", (req, res) => {
  res.json({
    succes: true,
    message: "Backend is Running Now!!!"
  });
});
