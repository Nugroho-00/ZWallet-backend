const db = require("../database/dbMysql");

const getAccountModel = (data) => {
  return new Promise((resolve, reject) => {
    const queryString =
      "SELECT u.email, u.username, u.phone, u.avatar, b.balance_nominal as balances FROM users u LEFT JOIN balances b ON u.id = b.user_id WHERE u.id = ?";
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
    const queryString = "UPDATE users SET password = ? WHERE id = ?";
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

const getMyContact = (id) => {
  return new Promise((resolve, reject) => {
    const queryString = "SELECT DISTINCT u.id, u.username, u.phone,  COUNT(u.username) as rank FROM transactions t JOIN users u ON t.executor_id = u.id WHERE (t.sender_id = ? OR t.receiver_id = ?) AND t.executor_id != ?";

    db.query(queryString, [id, id, id], (error, result) => {
      if (error) {
        return reject(error);
      } else if (result.length === 0) {
        return resolve({ conflict: "You don't have any contact yet" });
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
  changePassword,
  getMyContact
};
