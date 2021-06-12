const Router = require("express").Router();
const { authentication } = require("../middlewares/authentication");
const {
  errorMulterHandler,
  uploadAvatarImage
} = require("../middlewares/multer");
const {
  createProduct, getProduct, findUser
} = require("../handlers/extHandlers");

Router.post("/subs", errorMulterHandler(uploadAvatarImage.single("image")), authentication, createProduct);
Router.get("/subs", authentication, getProduct);

Router.get("/find", authentication, findUser);

module.exports = Router;
