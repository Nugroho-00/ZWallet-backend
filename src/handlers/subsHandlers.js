const { responseStandard } = require("../helpers/response");
const subsModels = require("../models/subsModel");

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
    const result = await subsModels.createProduct(dataProduct);
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
    const result = await subsModels.getProduct(id);
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

module.exports = {
  createProduct,
  getProduct
};
