const Router = require("express").Router();
const { authentication } = require("../middlewares/authentication");
const {
  postNotification, getNotification
} = require("../handlers/notificationHandlers");

Router.get("/", authentication, getNotification);
Router.post("/", authentication, postNotification);

module.exports = Router;
