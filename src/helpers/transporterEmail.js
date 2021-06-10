const nodemailer = require("nodemailer");
const { ADMIN_USER, ADMIN_PASSWORD } = process.env;

const transporterMail = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",
  auth: {
    user: ADMIN_USER,
    pass: ADMIN_PASSWORD
  }
});

module.exports = {
  transporterMail
};
