const db = require("../database/dbMysql");

const postNotification = (id, content) => {
  const data = {
    user_id: id,
    content: content
  };
  const qs = "INSERT INTO notifications SET ?";
  return new Promise((resolve, reject) => {
    db.query(qs, data, (error, result) => {
      if (error) {
        return reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
const getNotification = (id) => {
  const qs = "SELECT * FROM notifications WHERE user_id = ?";
  return new Promise((resolve, reject) => {
    db.query(qs, id, (error, result) => {
      if (error) {
        return reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  postNotification,
  getNotification
};
