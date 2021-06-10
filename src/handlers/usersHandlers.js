const usersModels = require("../models/usersModels");
const responseStandard = require("../helpers/response");

const getAccountInfo = async (req, res) => {
  try {
    const { id } = req.user;
    const users = await usersModels.getAccountModel(id);
    if (users.length) {
      return responseStandard(res, "User Profile", { data: users }, 200, true);
    } else {
      return responseStandard(res, "User profile not found!!", {}, 404, false);
    }
  } catch (error) {
    return responseStandard(res, error, {}, 500, false);
  }
};

const updateAccount = async (req, res) => {
  try {
    const { id } = req.user;
    let { username, email, phone } = req.body;
    const users = await usersModels.getAccountModel(id);
    if (!users) {
      responseStandard(res, "Users not found !!", {}, 404, false);
    }
    const valueUpdate = {
      username: username,
      email: email,
      phone: phone,
    };
    if (req.file) {
      const { file } = req;
      const url = `/images/users/${file.filename}`;
      const avatar = url;
      valueUpdate = { ...valueUpdate, avatar };
    }
    console.log(valueUpdate);
    const results = await usersModels.updateAccountModel([valueUpdate, id]);
    responseStandard(
      res,
      "Profile has been updated",
      { results: valueUpdate },
      200,
      true
    );
  } catch (error) {
    responseStandard(res, error, {}, 400, false);
  }
};

module.exports = { getAccountInfo, updateAccount };
