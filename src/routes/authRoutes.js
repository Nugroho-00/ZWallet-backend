const Router = require("express").Router();
const {
  registerAccount,
  loginAccount,
  createPinUser,
  postOTP,
  verifyOTP,
  resetPassword,
  logoutToken
} = require("../handlers/authHandlers");
const { authentication } = require("../middlewares/authentication");

Router.post("/register", registerAccount);
Router.post("/login", loginAccount);
Router.patch("/create-pin", authentication, createPinUser);
Router.post("/logout", logoutToken);

// reset password
Router.post("/send-otp", postOTP);
Router.post("/verify-otp", verifyOTP);
Router.post("/reset-password", authentication, resetPassword);

module.exports = Router;
