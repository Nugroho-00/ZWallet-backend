const Router = require("express").Router();
const { authentication } = require("../middlewares/authentication");
<<<<<<< HEAD
const {
  topUp, transfer, history
} = require("../handlers/transactionHandlers");
=======
const { topUp, transfer } = require("../handlers/transactionHandlers");
>>>>>>> fc1d40fa90c86f6cbd74489028c35acb6e73fdc3

// Topup
Router.patch("/topup", authentication, topUp);

// Transfer
Router.post("/transfer", authentication, transfer);

// Get transaction history
Router.get("/", authentication, history);

// Subscribe
Router.post("/subscribe", authentication);

module.exports = Router;
