const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generateOTP = require("../helpers/generatorOTP");
const { transporterMail } = require("../helpers/transporterEmail");
const { responseStandard } = require("../helpers/response");
const authModels = require("../models/authModels");

const registerAccount = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    if (!username || !email || !phone || !password) {
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
      phone: phone,
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
    if (result.length) {
      const validPass = await bcrypt.compare(password, result[0].password);
      if (!validPass) {
        return responseStandard(res, "Wrong Password!!!", {}, 400, false);
      } else {
        const { id, username } = result[0];
        const payload = { id, username };
        const options = {
          expiresIn: process.env.EXPIRE,
          issuer: process.env.ISSUER,
        };
        const token = jwt.sign(payload, process.env.SECRET_KEY, options);
        return responseStandard(res, "Login Succesfully", { token }, 200, true);
      }
    } else {
      return responseStandard(res, "Wrong email!!!", {}, 400, false);
    }
  } catch (error) {
    return responseStandard(res, error.message, {}, 400, false);
  }
};

const validationPin = async (req, res) => {
  try {
    const { id } = req.user;
    const { pin } = req.body;
    if (!pin) {
      return responseStandard(res, "Fields can not be empty", {}, 400, false);
    }
    const result = await authModels.checkPinModel(id);
    if (result) {
      const validPin = await bcrypt.compare(pin, result[0].pin);
      if (!validPin) {
        return responseStandard(res, "Wrong Pin!!!", {}, 400, false);
      } else {
        return responseStandard(res, "Confirm Pin Succesfully!", {}, 200, true);
      }
    } else {
      return responseStandard(res, "Pin not registered!!!", {}, 400, false);
    }
  } catch (error) {
    return responseStandard(res, error.message, {}, 400, false);
  }
};

const createPinUser = async (req, res) => {
  try {
    const { id } = req.user;
    const { pin } = req.body;
    if (!pin) {
      return responseStandard(res, "Pin cannot be empty");
    } else if (pin.length < 6) {
      return responseStandard(res, "Pin must be 6 characters!");
    }
    const salt = await bcrypt.genSalt(10);
    const enkripPin = await bcrypt.hash(pin, salt);
    await authModels.createPin([enkripPin, id]);
    return responseStandard(res, "Success create pin!", {}, 200, true);
  } catch (error) {
    return responseStandard(res, error.message, {}, 400, false);
  }
};

const postOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return responseStandard(res, "Field cannot be empty !!", {}, 400, false);
    }
    const result = await authModels.checkEmailModel(email);
    if (result.length) {
      const otp = generateOTP.generateOTP();
      await authModels.sendOTPModel([otp, result[0].id]);
      responseStandard(
        res,
        "Succes send OTP! Please verify your email",
        { userId: result[0].id },
        200,
        true
      );
      var mailOptions = {
        to: "chasterchaz01@gmail.com",
        subject: "Reset Password OTP",
        html:
          "<h2>Silahkan masukan kode OTP untuk melakukan reset password</h2>" +
          "<h1 style='font-weight:bold;'>" +
          otp +
          "</h1>" +
          "<p style='font-style:italic;'>expired in 5 minutes</p>",
      };
      transporterMail.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
      });
      setTimeout(async () => {
        await authModels.sendOTPModel([otp, result[0].id]);
        console.log("timeout OTP");
      }, 300000);
    } else {
      return responseStandard(res, "Email not found !!!", {}, 400, false);
    }
  } catch (error) {
    responseStandard(res, error.message, {}, 500, false);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp, userId } = req.body;
    if (!otp || !userId) {
      return responseStandard(res, "Field cannot be empty !!", {}, 400, false);
    }
    const result = await authModels.verifyOTPModel([otp, userId]);
    if (result.length) {
      const options = {
        expiresIn: process.env.EXPIRE,
        issuer: process.env.ISSUER,
      };
      const payload = {
        id: userId,
      };
      const token = jwt.sign(payload, process.env.SECRET_KEY, options);
      responseStandard(res, "Success verify OTP!", { token }, 200, true);
    } else {
      return responseStandard(
        res,
        "Wrong your userId or OTP !!!",
        {},
        400,
        false
      );
    }
  } catch (error) {
    responseStandard(res, error.message, {}, 400, false);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { newPassword } = req.body;
    if (!newPassword) {
      return responseStandard(res, "Field cannot be empty!", {}, 400, false);
    }
    if (newPassword.length < 8) {
      return responseStandard(
        res,
        "Password must be 8 Character!",
        {},
        400,
        false
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    await authModels.resetPasswordModel([hashPassword, id]);
    responseStandard(res, "Success to reset password!", {}, 200, true);
  } catch (error) {
    responseStandard(res, error, {}, 500, false);
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

module.exports = {
  registerAccount,
  loginAccount,
  logoutToken,
  createPinUser,
  resetPassword,
  postOTP,
  verifyOTP,
  validationPin,
};
