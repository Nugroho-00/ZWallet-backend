const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const responseStandard = require("../helpers/response");
const authModels = require("../models/authModels");

const registerAccount = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return responseStandard(res, "Fields can not be empty", {}, 400, false);
    }
    if (password.length < 8) {
      return responseStandard(
        res,
        "Password must be longer than 8 characters",
        {},
        400,
        false
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const emailExist = await authModels.checkEmailModel(email);
    if (emailExist.length) {
      return responseStandard(res, "Email already exists", {}, 400, false);
    }
    const users = {
      username: username,
      email: email,
      password: hashedPassword,
    };
    await authModels.createAcount(users);
    return responseStandard(res, "User succes registered!", {}, 200, true);
  } catch (error) {
    return responseStandard(res, error.message, {}, 500, false);
  }
};

const loginAccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return responseStandard(res, "Fields can not be empty", {}, 400, false);
    }
    const result = await authModels.getUsersEmail(email);
    if (result) {
      const validPass = await bcrypt.compare(password, result[0].password);
      if (!validPass) {
        return responseStandard(res, "Wrong Email or Password", {}, 400, false);
      } else {
        const data = {
          id: result[0].id,
          username: result[0].username,
        };
        const options = {
          expiresIn: process.env.EXPIRE,
          issuer: process.env.ISSUER,
        };
        const token = jwt.sign(data, process.env.SECRET_KEY, options);
        return responseStandard(res, "Login Succesfully", { token }, 200, true);
      }
    }
  } catch (error) {
    return responseStandard(res, error.message, {}, 400, false);
  }
};

const createPinUser = async (req, res) => {
  try {
    const { pin, email } = req.body;
    if (!pin) {
      return responseStandard(res, "Pin cannot be empty");
    }
    const { affectedRows } = await authModels.createPin(
      "users",
      { email },
      { pin }
    );
    if (affectedRows) {
      return responseStandard(res, "Create pin succesfuly", {}, 200, true);
    } else {
      return responseStandard(res, "Failed try again !", {}, 400, false);
    }
  } catch (error) {
    return responseStandard(res, error.message, {}, 500, false);
  }
};

const logoutToken = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    if (!token) {
      return responseStandard(res, "No token provided", {}, 400, false);
    }
    await authModels.logoutModel(token);
    return responseStandard(res, "Logout success", {}, 200, true);
  } catch (error) {
    return responseStandard(res, error, {}, 500, false);
  }
};

module.exports = { registerAccount, loginAccount, logoutToken, createPinUser };
