const usersModels = require("../models/usersModels");
const { responseStandard } = require("../helpers/response");

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
    let valueUpdate = req.body;
    const users = await usersModels.getAccountModel(id);
    if (!users) {
      responseStandard(res, "Users not found !!", {}, 404, false);
    }
    if (req.file) {
      const { file } = req;
      const url = `/images/users/${file.filename}`;
      const avatar = url;
      valueUpdate = { ...valueUpdate, avatar };
    }
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

const changePinHandlers = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPin, newPin, newPinConfirmation } = req.body;
    const checkPin = await usersModels.getUsersId(id);
    if (checkPin[0].pin === oldPin) {
      if (newPin === newPinConfirmation) {
        const result = await usersModels.changePinModel([newPin, id]);
        responseStandard(res, "Success update pin", {}, 200, true);
      } else {
        responseStandard(
          res,
          "New pin and new pin confirmation must be the same",
          {},
          401,
          false
        );
      }
    } else {
      return responseStandard(res, "Old pin wrong", {}, 401, false);
    }
  } catch (error) {
    return responseStandard(res, error, {}, 400, false);
  }
};

module.exports = { getAccountInfo, updateAccount, changePinHandlers };
