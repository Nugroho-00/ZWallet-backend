const Router = require("express").Router();
const {
  getAccountInfo,
  updateAccount,
  changePinHandlers,
  changePasswordHandlers,
  getMyContact
} = require("../handlers/usersHandlers");
const { authentication } = require("../middlewares/authentication");
const {
  errorMulterHandler,
  uploadAvatarImage
} = require("../middlewares/multer");

Router.get("/", authentication, getAccountInfo);
Router.patch(
  "/edit",
  authentication,
  errorMulterHandler(uploadAvatarImage.single("image")),
  updateAccount
);
Router.patch("/edit-pin", authentication, changePinHandlers);
Router.patch("/edit-password", authentication, changePasswordHandlers);

Router.get("/my-contact", authentication, getMyContact);

module.exports = Router;
