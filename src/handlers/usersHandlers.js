const usersModels = require("../models/usersModels");
const { responseStandard, writeResponsePaginated } = require("../helpers/response");
const bcrypt = require("bcrypt");

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
    await usersModels.updateAccountModel([valueUpdate, id]);
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
    if (!oldPin || !newPin || !newPinConfirmation) {
      return responseStandard(res, "Field cannot be empty!!!", {}, 400, false);
    }
    const checkPin = await usersModels.getUsersId(id);
    const validPin = await bcrypt.compare(oldPin, checkPin[0].pin);
    if (!validPin) {
      return responseStandard(res, "Old pin wrong", {}, 400, false);
    }
    if (validPin) {
      if (newPinConfirmation === newPin) {
        const salt = await bcrypt.genSalt(10);
        const enkripPin = await bcrypt.hash(newPin, salt);
        await usersModels.changePinModel([enkripPin, id]);
        responseStandard(res, "Success update pin", {}, 200, true);
      } else {
        responseStandard(
          res,
          "NewPin and NewPinConfirmation must be the same!",
          {},
          401,
          false
        );
      }
    } else {
      return responseStandard(res, "Failed to change Pin!!", {}, 400, false);
    }
  } catch (error) {
    return responseStandard(res, error, {}, 400, false);
  }
};

const changePasswordHandlers = async (req, res) => {
  try {
    const { id } = req.user;
    const { currentPassword, newPassword, repeatPassword } = req.body;
    if (!currentPassword || !newPassword || !repeatPassword) {
      return responseStandard(res, "Field cannot be empty!!!", {}, 400, false);
    }
    const checkPassword = await usersModels.getUsersId(id);
    const validPassword = await bcrypt.compare(
      currentPassword,
      checkPassword[0].password
    );
    if (!validPassword) {
      return responseStandard(res, "Current password wrong!!", {}, 400, false);
    }
    if (validPassword) {
      if (newPassword === repeatPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        await usersModels.changePassword([hashPassword, id]);
        responseStandard(res, "Success update password", {}, 200, true);
      } else {
        responseStandard(
          res,
          "NewPassword and repeatPassword must be the same!",
          {},
          401,
          false
        );
      }
    } else {
      return responseStandard(
        res,
        "Failed to change Password!!",
        {},
        400,
        false
      );
    }
  } catch (error) {
    return responseStandard(res, error, {}, 400, false);
  }
};

const getMyContact = async (req, res) => {
  const { baseUrl, path, hostname, protocol } = req;

  try {
    const { id } = req.user;
    const { search, sort, pages } = req.query;
    const finalResult = await usersModels.getMyContact(id, search, sort, pages);

    const { result, count, page, limit } = finalResult;
    const totalPage = Math.ceil(count / limit) || 1;

    const url =
      protocol + "://" + hostname + ":" + process.env.PORT + baseUrl + path;

    // const prev = page === 1 ? null : url + `?pages=${page - 1}`;
    // const next = page === totalPage ? null : url + `?pages=${page + 1}`;

    let prev, next;
    if (!search && !sort) {
      prev = page === 1 ? null : url + `?pages=${page - 1}`;
      next = page === totalPage ? null : url + `?pages=${page + 1}`;
    } else if (search && !sort) {
      prev = page === 1 ? null : url + `?search=${search}&pages=${page - 1}`;
      next = page === totalPage ? null : url + `?search=${search}&pages=${page + 1}`;
    } else if (!search && sort) {
      prev = page === 1 ? null : url + `?sort=${sort}&pages=${page - 1}`;
      next = page === totalPage ? null : url + `?sort=${sort}&pages=${page + 1}`;
    } else if (search && sort) {
      prev = page === 1 ? null : url + `?search=${search}&sort=${sort}&pages=${page - 1}`;
      next = page === totalPage ? null : url + `?search=${search}&sort=${sort}&pages=${page + 1}`;
    }

    if (finalResult) {
      // console.log(result);
      if (finalResult.conflict) {
        return responseStandard(res, finalResult.conflict, {}, 200, false);
      } else {
        const info = {
          count,
          page,
          totalPage,
          next,
          prev
        };
        return writeResponsePaginated(res, 200, info, result);
      }
    }
  } catch (error) {
    // console.log(error);
    return responseStandard(res, error.message, {}, 500, false);
  }
};

module.exports = {
  getAccountInfo,
  updateAccount,
  changePinHandlers,
  changePasswordHandlers,
  getMyContact
};
