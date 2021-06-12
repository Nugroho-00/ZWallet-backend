const { responseStandard } = require("../helpers/response");
const extModels = require("../models/extModels");

const createProduct = async (req, res) => {
  try {
    let dataProduct = req.body;
    console.log(req.body);
    if (req.file) {
      const { file } = req;
      const url = `/images/products/${file.filename}`;
      const avatar = url;
      dataProduct = { ...dataProduct, avatar };
    }
    console.log("heio", dataProduct);
    const result = await extModels.createProduct(dataProduct);
    if (result) {
      console.log(result);
      return responseStandard(
        res,
        "Product created!",
        {},
        200,
        true
      );
    }
  } catch (error) {
    console.log(error);
    return responseStandard(res, error.message, {}, 500, false);
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.user;
    const result = await extModels.getProduct(id);
    if (result) {
      console.log(result);
      return responseStandard(
        res,
        "",
        { result },
        200,
        true
      );
    }
  } catch (error) {
    console.log(error);
    return responseStandard(res, error.message, {}, 500, false);
  }
};

const findUser = async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await extModels.findUser(phone);

    if (result) {
      if (result.conflict) {
        return responseStandard(res, result.conflict, {}, 200, false);
      } else {
        return responseStandard(
          res,
          "User found",
          { result },
          200,
          true
        );
      }
    }
  } catch (error) {
    return responseStandard(res, error.message, {}, 500, false);
  }
};

module.exports = {
  createProduct,
  getProduct,
  findUser
};
