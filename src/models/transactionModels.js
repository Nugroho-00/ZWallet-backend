const db = require("../database/dbMysql");

const topUp = (id, amount) => {
  return new Promise((resolve, reject) => {
    const getPrevBalance = "SELECT balance_nominal FROM balances WHERE user_id = ?";
    db.query(getPrevBalance, id, (error, result) => {
      if (error) {
        console.log(error);
        return reject(error);
      } else {
        console.log(result.length);
        const isExist = result.length !== 0;
        const newBalance = isExist ? result[0].balance_nominal + Number(amount) : Number(amount);
        // // console.log("hae", result[0].balance_nominal + 20000);

        if (isExist) {
          const data = {
            balance_nominal: newBalance
          };
          const queryString = "UPDATE balances SET ? WHERE id = ?";
          db.query(queryString, [data, id], (error, result) => {
            if (error) {
              return reject(error);
            } else {
              return resolve(result);
            }
          });
        } else {
          const data = {
            user_id: id,
            balance_nominal: newBalance
          };
          const queryString = "INSERT INTO balances SET ?";
          db.query(queryString, [data], (error, result) => {
            if (error) {
              return reject(error);
            } else {
              return resolve(result);
            }
          });
        }
      }
    });
  });
};

module.exports = {
  topUp
};
