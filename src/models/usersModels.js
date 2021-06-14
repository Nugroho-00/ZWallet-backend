const db = require("../database/dbMysql");

const getAccountModel = (data) => {
  return new Promise((resolve, reject) => {
    const queryString =
      "SELECT u.id, u.email, u.username, u.phone, u.avatar, b.balance_nominal as balances, u.pin FROM users u LEFT JOIN balances b ON u.id = b.user_id WHERE u.id = ?";
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

const getMyContact = (id, search, sort, pages) => {
  return new Promise((resolve, reject) => {
    let qs = "SELECT DISTINCT IF(t.type='credit', r.id,  s.id) as id, IF(t.type='credit', r.username,  s.username) as username, IF(t.type='credit', r.avatar,  s.avatar) as avatar, IF(t.type='credit', r.phone, s.phone) as phone, COUNT(s.id) as rank FROM transactions t JOIN users s ON t.sender_id = s.id LEFT JOIN users r ON t.receiver_id = r.id  WHERE t.executor_id=?  AND t.type != 'subscription' AND (s.id != t.executor_id OR r.id != t.executor_id) GROUP BY id";

    let order = false;
    if (sort) {
      const ordered = sort.split("-");
      if (ordered[0] === "name") {
        if (ordered[1] === "AZ") {
          order = " ORDER BY username ASC ";
        } else if (ordered[1] === "ZA") {
          order = " ORDER BY username DESC ";
        } else {
          order = false;
        }
      } else if (ordered[0] === "rank") {
        if (ordered[1] === "AZ") {
          order = " ORDER BY rank ASC ";
        } else if (ordered[1] === "ZA") {
          order = " ORDER BY rank DESC ";
        } else {
          order = false;
        }
      }
    }
    if (!search && !order) {
      qs = qs + " ORDER BY username ASC";
    } else if (search && !order) {
      qs = qs + " AND username LIKE '%" + search + "%' " + " ORDER BY username ASC";
    } else if (!search && order) {
      qs = qs + order;
    } else if (search && order) {
      qs = qs + " AND username LIKE '%" + search + "%' " + order;
    }

    const paginate = " LIMIT ? OFFSET ?";

    const fullQuery = qs + paginate;

    const limit = 5;
    const page = Number(pages) || 1;
    const offset = (page - 1) * limit;

    db.query(fullQuery, [id, limit, offset], (error, result) => {
      if (error) {
        return reject(error);
      } else if (result.length === 0) {
        return resolve({ conflict: "You don't have any contact yet" });
      } else if (!result[0].id) {
        // console.log(result);
        return resolve({ conflict: "You found nothing" });
      } else {
        const qsCount = "SELECT COUNT(*) AS count FROM(" + qs + ") as count";
        db.query(qsCount, [id], (error, data) => {
          if (error) {
            return reject(error);
          } else {
            const { count } = data[0];
            const finalResult = {
              result,
              count,
              page,
              limit
            };
            resolve(finalResult);
          }
        });
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
