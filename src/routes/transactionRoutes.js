const Router = require("express").Router();
const { authentication } = require("../middlewares/authentication");
const {
  topUp
} = require("../handlers/transactionHandlers");
// Topup
Router.patch("/topup", authentication, topUp);

// Transfer
Router.post("/transfer", authentication);

// Subscribe
Router.post("/subscribe", authentication);

// Get transaction history
Router.get("/", authentication);

module.exports = Router;
