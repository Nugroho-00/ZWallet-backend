const jwt = require("jsonwebtoken");
const joi = require("joi");
const bcrypt = require("bcrypt");
const generateOTP = require("../helpers/generatorOTP");
const { transporterMail } = require("../helpers/transporterEmail");
const { responseStandard } = require("../helpers/response");
const authModels = require("../models/authModels");

const registerAccount = async (req, res) => {
  try {
    const schema = joi.object({
      username: joi
        .string()
        .max(30)
        .min(4)
        .pattern(/^[a-z ,.'-]+$/i)
        .required()
        .messages({
          "string.base": "Username should be a type of 'text'",
          "string.empty": "Username cannot be an empty field",
          "string.max": "Username should have a max length of {#limit}",
          "string.min": "Username should have a minimum length of {#limit}",
          "any.required": "Username is a required field",
          "string.pattern.base": "Username cannot contain number"
        }),
      email: joi.string().email({ minDomainSegments: 2 }).required().messages({
        "string.email": "Wrong Email format",
        "string.empty": "Email cannot be an empty field",
        "any.required": "Email is a required field"
      }),
      phone: joi.number().integer().min(10).required().messages({
        "number.base":
          "Phone number is not a number or could not be cast to a number",
        "number.empty": "Phone number cannot be an empty field",
        "number.min": "Phone number should have a minimum length of {#limit}",
        "any.required": "Phone is a required field"
      }),
      password: joi
        .string()
        .required()
        .min(8)
        .pattern(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%^*#?&])[A-Za-z\d@$!%^*#?&]{8,}$/
        )
        .messages({
          "string.empty": "Password cannot be an empty field",
          "string.min": "Password should have a minimum length of {#limit}",
          "any.required": "Password is a required field",
          "string.pattern.base":
            "Password must contain letter, number and special character"
        })
    });
    const { value, error } = schema.validate(req.body);
    if (error) {
      return responseStandard(
        res,
        "Error!!",
        { error: error.message },
        400,
        false
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(value.password, salt);
    const emailExist = await authModels.checkEmailModel(value.email);
    if (emailExist.length) {
      return responseStandard(res, "Email already exists", {}, 400, false);
    }
    const users = {
      username: value.username,
      email: value.email,
      phone: value.phone,
      password: hashedPassword
    };
    await authModels.createAcount(users);
    return responseStandard(res, "User succes registered!", {}, 200, true);
  } catch (error) {
    return responseStandard(res, error.message, {}, 500, false);
  }
};

const loginAccount = async (req, res) => {
  try {
    const schema = joi.object({
      email: joi.string().email({ minDomainSegments: 2 }).required().messages({
        "string.email": "Wrong Email format",
        "string.empty": "Email cannot be an empty field",
        "any.required": "Email is a required field"
      }),
      password: joi
        .string()
        .required()
        .min(8)
        .pattern(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%^*#?&])[A-Za-z\d@$!%^*#?&]{8,}$/
        )
        .messages({
          "string.empty": "Password cannot be an empty field",
          "string.min": "Password should have a minimum length of {#limit}",
          "any.required": "Password is a required field",
          "string.pattern.base":
            "Password must contain letter, number and special character"
        })
    });
    const { value, error } = schema.validate(req.body);
    if (error) {
      return responseStandard(
        res,
        "Error!!",
        { error: error.message },
        400,
        false
      );
    }
    const result = await authModels.getUsersEmail(value.email);
    if (result.length) {
      const validPass = await bcrypt.compare(
        value.password,
        result[0].password
      );
      if (!validPass) {
        return responseStandard(res, "Wrong Password!!!", {}, 400, false);
      } else {
        const { id, username } = result[0];
        const payload = { id, username };
        const options = {
          expiresIn: process.env.EXPIRE,
          issuer: process.env.ISSUER
        };
        const token = jwt.sign(payload, process.env.SECRET_KEY, options);
        const data = {
          token: token,
          status: result[0].status
        };
        return responseStandard(res, "Login Succesfully", { ...data }, 200, true);
      }
    } else {
      return responseStandard(res, "Email not found!!!", {}, 400, false);
    }
  } catch (error) {
    return responseStandard(res, error.message, {}, 400, false);
  }
};

const validationPin = async (req, res) => {
  try {
    const { id } = req.user;
    const schema = joi.object({
      pin: joi.number().integer().min(6).required().messages({
        "number.base": "Pin is not a number or could not be cast to a number",
        "number.empty": "Pin cannot be an empty field",
        "number.min": "Pin should have a minimum length of {#limit}",
        "any.required": "Pin is a required field"
      })
    });
    const { value, error } = schema.validate(req.body);
    if (error) {
      return responseStandard(
        res,
        "Error!!",
        { error: error.message },
        400,
        false
      );
    }
    const result = await authModels.checkPinModel(id);
    if (result) {
      const validPin = await bcrypt.compare(
        value.pin.toString(),
        result[0].pin
      );
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
    const schema = joi.object({
      pin: joi.number().integer().min(6).required().messages({
        "number.base": "Pin is not a number or could not be cast to a number",
        "number.empty": "Pin cannot be an empty field",
        "number.min": "Pin should have a minimum length of {#limit}",
        "any.required": "Pin is a required field"
      }),
      id: joi.number().integer()
    });
    const { value, error } = schema.validate(req.body);
    if (error) {
      return responseStandard(
        res,
        "Error!!",
        { error: error.message },
        400,
        false
      );
    }
    // console.log(value.pin, "em", value.email);
    const salt = await bcrypt.genSalt(10);
    const enkripPin = await bcrypt.hash(value.pin.toString(), salt);
    await authModels.createPin(enkripPin, value.id);
    return responseStandard(res, "Success create pin!", {}, 200, true);
  } catch (error) {
    return responseStandard(res, error.message, {}, 400, false);
  }
};

const postOTP = async (req, res) => {
  try {
    const schema = joi.object({
      email: joi.string().email({ minDomainSegments: 2 }).required().messages({
        "string.email": "Wrong Email format",
        "string.empty": "Email cannot be an empty field",
        "any.required": "Email is a required field"
      })
    });
    const { value, error } = schema.validate(req.body);
    if (error) {
      return responseStandard(
        res,
        "Error!!",
        { error: error.message },
        400,
        false
      );
    }
    const result = await authModels.checkEmailModel(value.email);
    if (result.length) {
      const otp = generateOTP.generateOTP();
      console.log(otp);
      await authModels.sendOTPModel([otp, result[0].id]);
      responseStandard(
        res,
        "Succes send OTP! Please verify your email",
        { userId: result[0].id },
        200,
        true
      );
      const mailOptions = {
        to: value.email,
        subject: "ZWallet Authentication",
        html:
          "<h2>To authenticate, please use the following One Time Password (OTP)</h2>" +
          "<h1 style='font-weight:bold;'>" +
          otp +
          "</h1>" +
          "<p style='font-style:italic;'>expired in 5 minutes. Do not share this OTP with anyone. We take your account security very seriously.</p>"
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
      return responseStandard(
        res,
        "Email not found or not registered !!!",
        {},
        400,
        false
      );
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
    console.log(result);
    if (result.conflict) {
      return responseStandard(
        res,
        "Wrong your userId or OTP !!!",
        {},
        400,
        false
      );
    } else {
      const options = {
        expiresIn: process.env.EXPIRE,
        issuer: process.env.ISSUER
      };
      const payload = {
        id: userId
      };
      const token = jwt.sign(payload, process.env.SECRET_KEY, options);
      responseStandard(res, "Success verify OTP!", { token }, 200, true);
    }
  } catch (error) {
    responseStandard(res, error.message, {}, 400, false);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.user;
    const schema = joi.object({
      newPassword: joi
        .string()
        .required()
        .min(8)
        .pattern(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%^*#?&])[A-Za-z\d@$!%^*#?&]{8,}$/
        )
        .messages({
          "string.empty": "Password cannot be an empty field",
          "string.min": "Password should have a minimum length of {#limit}",
          "any.required": "Password is a required field",
          "string.pattern.base":
            "Password must contain letter, number and special character"
        })
    });
    const { value, error } = schema.validate(req.body);
    if (error) {
      return responseStandard(
        res,
        "Error!!",
        { error: error.message },
        400,
        false
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(value.newPassword, salt);
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
  validationPin
};
