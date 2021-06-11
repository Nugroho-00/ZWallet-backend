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

// const validationPin = async (req, res) => {
//   try {
//     const { id } = req.user;
//     const { pin } = req.body;
//     const result = await authModels.checkPinModel([pin, id]);
//     if (result === pin) {
//       return responseStandard(res, "Success!!");
//     } else if (result != pin) {
//       return responseStandard(res, "wrong pin !!");
//     } else if (result.length < 1) {
//       return responseStandard(res, "pin not registered!! create pin Now!");
//     }
//   } catch (error) {
//     return responseStandard(res, error.message, {}, 400, false);
//   }
// };

const createPinUser = async (req, res) => {
  try {
    const { id } = req.user;
    const { pin } = req.body;
    if (!pin) {
      return responseStandard(res, "Pin cannot be empty");
    } else if (pin.length < 6) {
      return responseStandard(res, "Pin must be 6 characters!");
    }
    await authModels.createPin([pin, id]);
    return responseStandard(res, "success create pin!", {}, 200, true);
  } catch (error) {
    return responseStandard(res, error.message, {}, 400, false);
  }
};

const postOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authModels.checkEmailModel(email);
    if (result) {
      const otp = generateOTP.generateOTP();
      await authModels.sendOTPModel([otp, result[0].id]);
      responseStandard(res, null, { ...result[0].id }, 200, true);
      console.log(otp);
      var mailOptions = {
        to: "chasterchaz01@gmail.com",
        subject: "Reset Password OTP",
        html:
          "<h3>Haloo!! </h3>" +
          "<h3>Silahkan masukan kode OTP untuk melakukan reset password</h3>" +
          "<h1 style='font-weight:bold;'>" +
          otp +
          "</h1>" +
          "<h5>expired in 5 minutes</h5>",
      };
      transporterMail.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      });
      setTimeout(async () => {
        await authModels.sendOTPModel([otp, result[0].id]);
        console.log("timeout OTP");
      }, 300000);
    }
  } catch (error) {
    responseStandard(res, "error bgsd!!!", { error }, 403, false);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp, id } = req.body;
    const result = await authModels.verifyOTPModel([otp, id]);
    console.log(result);
    if (result) {
      const options = {
        expiresIn: process.env.EXPIRE,
        issuer: process.env.ISSUER,
      };
      const payload = {
        id: id,
      };
      const token = jwt.sign(payload, process.env.SECRET_KEY, options);
      responseStandard(res, null, { token }, 200, true);
    }
  } catch (error) {
    console.log(error);
    responseStandard(res, error, {}, 400, false);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    const result = await authModels.resetPasswordModel([
      hashPassword,
      req.user.id,
    ]);
    responseStandard(res, "success to reset password!", { result }, 200, true);
  } catch (error) {
    responseStandard(res, error, {}, 400, false);
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
};
