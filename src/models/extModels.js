const db = require("../database/dbMysql");

const createProduct = (data) => {
  console.log(data);
  return new Promise((resolve, reject) => {
    const queryString = "INSERT INTO products SET ?";
    db.query(queryString, data, (error, result) => {
      if (error) {
        return reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
const getProduct = () => {
  const qs = "SELECT * FROM products";
  return new Promise((resolve, reject) => {
    db.query(qs, (error, result) => {
      if (error) {
        return reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const findUser = (phone) => {
  const qs = "SELECT * FROM users WHERE phone = ?";
  return new Promise((resolve, reject) => {
    db.query(qs, phone, (error, result) => {
      if (error) {
        return reject(error);
      } else if (result.length === 0) {
        return resolve({ conflict: "This user doesn't exist" });
      } else {
        resolve(result);
      }
    });
  });
};
module.exports = {
  createProduct,
  getProduct,
  findUser
};
