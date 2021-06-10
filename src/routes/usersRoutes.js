const Router = require("express").Router();
const { getAccountInfo, updateAccount } = require("../handlers/usersHandlers");
const { authentication } = require("../middlewares/authentication");
const {
  errorMulterHandler,
  uploadAvatarImage,
} = require("../middlewares/multer");

Router.get("/", authentication, getAccountInfo);
Router.patch(
  "/edit",
  authentication,
  errorMulterHandler(uploadAvatarImage.single("image")),
  updateAccount
);

module.exports = Router;
