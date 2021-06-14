/* eslint-disable quotes */
const db = require("../database/dbMysql");

const createAcount = (data) => {
  return new Promise((resolve, reject) => {
    const queryString = "INSERT INTO users SET ?";
    db.query(queryString, data, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

const checkEmailModel = (email) => {
  return new Promise((resolve, reject) => {
    const queryString = "SELECT * FROM users WHERE email = ?";
    db.query(queryString, email, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

const checkPinModel = (data) => {
  return new Promise((resolve, reject) => {
    const queryString = "SELECT * FROM users WHERE id = ?";
    db.query(queryString, data, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

const getUsersEmail = (email) => {
  return new Promise((resolve, reject) => {
    const queryString = `SELECT * FROM users WHERE email = ? `;
    db.query(queryString, email, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const getToken = (token) => {
  return new Promise((resolve, reject) => {
    const queryString = "SELECT * FROM blacklist_token WHERE token = ?";
    db.query(queryString, token, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const createPin = (pin, id) => {
  return new Promise((resolve, reject) => {
    const queryString = "UPDATE users SET pin = ? WHERE id = ?";
    db.query(queryString, [pin, id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const resetPasswordModel = (data) => {
  return new Promise((resolve, reject) => {
    const queryString = `UPDATE users SET password = ? WHERE id = ?`;
    db.query(queryString, data, (error, result) => {
      if (error) {
        reject(error);
      } else if (result.length === 0) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });
};

const verifyOTPModel = (data) => {
  return new Promise((resolve, reject) => {
    const queryString = `SELECT * FROM users WHERE otp = ? and id = ?`;
    db.query(queryString, data, (error, result) => {
      if (error) {
        reject(error);
      } else if (result.length) {
        // Change user status
        const qs = "UPDATE users SET status = 'verified' WHERE id = ?";
        db.query(qs, data[1], (error, result) => {
          if (error) {
            return reject(error);
          } else {
            console.log(result);
            resolve(result);
          }
        });
      } else {
        resolve({ conflict: "Wrong your userId or OTP !!!" });
      }
    });
  });
};

const sendOTPModel = (data) => {
  return new Promise((resolve, reject) => {
    const queryString = `UPDATE users SET otp = ? WHERE id = ?`;
    db.query(queryString, data, (error, result) => {
      if (error) {
        reject(error);
      } else if (result.length === 0) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });
};

const logoutModel = (token) => {
  return new Promise((resolve, reject) => {
    const queryString =
      "INSERT INTO blacklist_token (token, expire) VALUES (?, NOW() + INTERVAL 3 HOUR)";
    db.query(queryString, token, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  createAcount,
  checkEmailModel,
  checkPinModel,
  getUsersEmail,
  getToken,
  createPin,
  resetPasswordModel,
  sendOTPModel,
  verifyOTPModel,
  logoutModel
};
