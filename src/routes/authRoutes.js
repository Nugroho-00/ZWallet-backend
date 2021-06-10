const Router = require("express").Router();
const {
  registerAccount,
  loginAccount,
  createPinUser,
  logoutToken,
} = require("../handlers/authHandlers");

Router.post("/register", registerAccount);
Router.post("/login", loginAccount);
Router.patch("/create/pin", createPinUser);
Router.post("/logout", logoutToken);

module.exports = Router;
