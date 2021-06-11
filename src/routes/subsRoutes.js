const Router = require("express").Router();
const { authentication } = require("../middlewares/authentication");
const {
  errorMulterHandler,
  uploadAvatarImage
} = require("../middlewares/multer");
const {
  createProduct, getProduct
} = require("../handlers/subsHandlers");

Router.post("/subs", errorMulterHandler(uploadAvatarImage.single("image")), authentication, createProduct);
Router.get("/subs", authentication, getProduct);

module.exports = Router;
