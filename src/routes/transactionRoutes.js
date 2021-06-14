const Router = require("express").Router();
const { authentication } = require("../middlewares/authentication");
const {
  topUp, transfer, history, detail, subscribe
} = require("../handlers/transactionHandlers");

// Topup
Router.patch("/topup", topUp);

// Transfer
Router.post("/transfer", authentication, transfer);

// Get transaction history
Router.get("/", authentication, history);

// Get transaction detail
Router.get("/detail/:id", authentication, detail);

// Subscribe
Router.post("/subscribe", authentication, subscribe);

module.exports = Router;
