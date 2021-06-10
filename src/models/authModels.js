/* eslint-disable quotes */
const db = require('../database/dbMysql');

const createAcount = (data) => {
  return new Promise((resolve, reject) => {
    const queryString = 'INSERT INTO users SET ?';
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
    const queryString = 'SELECT email FROM users WHERE email = ?';
    db.query(queryString, email, (error, results) => {
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
    const queryString = 'SELECT * FROM users WHERE email=?';
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
    const queryString = 'SELECT * FROM blacklist_token WHERE token = ?';
    db.query(queryString, token, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const createPin = (table, data, id) => {
  return new Promise((resolve, reject) => {
    const queryString = 'UPDATE ?? SET ? WHERE ?';
    db.query(queryString, [table, data, id], (err, result, _field) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const logoutModel = (token) => {
  return new Promise((resolve, reject) => {
    const queryString =
            'INSERT INTO blacklist_token (token, expire) VALUES (?, NOW() + INTERVAL 3 HOUR)';
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
  getUsersEmail,
  getToken,
  createPin,
  logoutModel
};
