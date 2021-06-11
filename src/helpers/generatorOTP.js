const generateOTP = () => {
  // const digits = "0123456789";
  // const otpLength = 4;
  // let otp = "";
  // for (let i = 1; i <= otpLength; i++) {
  //   const index = Math.floor(Math.random() * digits.length);
  //   otp = otp + digits[index];
  // }
  // return otp;
  return Math.random().toString(36).slice(2, 8);
};

module.exports = {
  generateOTP
};
