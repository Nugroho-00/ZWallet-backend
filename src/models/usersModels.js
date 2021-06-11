const db = require("../database/dbMysql");

const getAccountModel = (data) => {
  return new Promise((resolve, reject) => {
    const queryString =
      "SELECT email,username,phone,avatar FROM users WHERE id = ?";
    db.query(queryString, data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const getUsersId = (data) => {
  return new Promise((resolve, reject) => {
    const queryString = "SELECT * FROM users WHERE id = ?";
    db.query(queryString, data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const changePinModel = (data) => {
  return new Promise((resolve, reject) => {
    const queryString = "UPDATE users SET pin = ? WHERE id = ?";
    db.query(queryString, data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const changePassword = (data) => {
  return new Promise((resolve, reject) => {
    const queryString = "";
    db.query(queryString, data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const updateAccountModel = (data) => {
  return new Promise((resolve, reject) => {
    const queryString = "UPDATE users SET ? WHERE id = ?";
    db.query(queryString, data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  getAccountModel,
  updateAccountModel,
  getUsersId,
  changePinModel,
};
