/* eslint-disable camelcase */
const db = require("../database/dbMysql");

const topUp = (id, amount) => {
  const transaction_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return new Promise((resolve, reject) => {
    const getPrevBalance =
      "SELECT balance_nominal FROM balances WHERE user_id = ?";
    db.query(getPrevBalance, id, (error, result) => {
      if (error) {
        console.log(error);
        return reject(error);
      } else {
        console.log(result.length);
        const isExist = result.length > 0;
        const newBalance = isExist
          ? result[0].balance_nominal + Number(amount)
          : Number(amount);

        if (isExist) {
          const data = {
            balance_nominal: newBalance
          };
          const queryString = "UPDATE balances SET ? WHERE user_id = ?";
          db.query(queryString, [data, id], (error, result) => {
            if (error) {
              return reject(error);
            } else {
              console.log("Are u here?");
              const historyData = {
                sender_id: id,
                receiver_id: id,
                nominal: amount,
                type: "top up",
                transaction_id: transaction_id
              };
              const addHistory = "INSERT INTO transactions SET ?";
              db.query(addHistory, historyData, (error, result) => {
                if (error) {
                  return reject(error);
                } else {
                  return resolve(result);
                }
              });
            }
          });
        } else {
          const data = {
            user_id: id,
            balance_nominal: newBalance
          };
          const queryString = "INSERT INTO balances SET ?";
          db.query(queryString, [data], (error, result) => {
            console.log("Are u here2?");

            if (error) {
              return reject(error);
            } else {
              const historyData = {
                sender_id: id,
                receiver_id: id,
                nominal: amount,
                type: "top up",
                transaction_id: transaction_id

              };
              const addHistory = "INSERT INTO transactions SET ?";
              db.query(addHistory, historyData, (error, result) => {
                if (error) {
                  return reject(error);
                } else {
                  return resolve(result);
                }
              });
            }
          });
        }
      }
    });
  });
};

const transfer = (sender, phone, amount, note) => {
  const transaction_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  let receiver, senderBalance, receiverBalance;

  return new Promise((resolve, reject) => {
    // console.log(phone);
    const getReceiverId = "SELECT id from users WHERE phone = ?";
    db.query(getReceiverId, phone, (error, result) => {
      if (error) {
        return reject(error);
      } else if (result.length === 0) {
        return resolve({ conflict: "No user is associated with the phone number" });
      } else {
        // console.log(result);
        receiver = result[0].id;
        //   Check sender balance
        const getPrevBalance =
          "SELECT balance_nominal FROM balances WHERE user_id = ?";
        db.query(getPrevBalance, sender, (error, result) => {
          if (error) {
            return reject(error);
          } else if (result.length > 0) {
            senderBalance = Number(result[0].balance_nominal);
            // Add to transaction history table
            if (senderBalance > amount) {
              const dataSender = {
                sender_id: sender,
                receiver_id: receiver,
                nominal: amount,
                type: "credit",
                note: note,
                transaction_id: transaction_id

              };

              const dataReceiver = {
                sender_id: sender,
                receiver_id: receiver,
                nominal: amount,
                type: "debit",
                note: note,
                transaction_id: transaction_id

              };

              const addTransaction = "INSERT INTO transactions SET ?";
              db.query(addTransaction, dataSender, (error, result) => {
                if (error) {
                  return reject(error);
                } else {
                  db.query(addTransaction, dataReceiver, (error, result) => {
                    if (error) {
                      return reject(error);
                    } else {
                      // Reducing sender balance
                      const data = {
                        balance_nominal: senderBalance - Number(amount)
                      };
                      const updateBalance =
                        "UPDATE balances SET ? WHERE user_id = ?";
                      db.query(updateBalance, [data, sender], (error, result) => {
                        if (error) {
                          return reject(error);
                        } else {
                          console.log(data.balance_nominal);
                          // Add balance to receiver
                          db.query(getPrevBalance, receiver, (error, result) => {
                            if (error) {
                              return reject(error);
                            } else if (result.length > 0) {
                              receiverBalance = Number(result[0].balance_nominal);
                              const data = {
                                balance_nominal: receiverBalance + Number(amount)
                              };

                              db.query(
                                updateBalance,
                                [data, receiver],
                                (error, result) => {
                                  if (error) {
                                    return reject(error);
                                  } else {
                                    resolve(result);
                                  }
                                }
                              );
                            } else {
                              const data = {
                                user_id: receiver,
                                balance_nominal: amount
                              };
                              const queryString = "INSERT INTO balances SET ?";
                              db.query(queryString, [data], (error, result) => {
                                if (error) {
                                  return reject(error);
                                } else {
                                  resolve(result);
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            } else {
              return resolve({ conflict: "Not enough balance" });
            }
          } else {
            return resolve({ conflict: "Not enough balance" });
          }
        });
      }
    });
  });
};

const history = (id, search, start, end, sort, pages) => {
  const qs = "SELECT s.username as 'current_user', r.username as receiver, t.nominal, t.type, t.note, t.created_at FROM transactions t JOIN users s ON t.sender_id = s.id JOIN users r ON t.receiver_id = r.id WHERE t.receiver_id=? OR t.sender_id=? GROUP BY transaction_id ORDER BY created_at DESC";
  // SELECT * FROM transactions WHERE (sender_id =2 OR receiver_id = 2) AND nominal>10000 AND type='top up' AND DATE(created_at) BETWEEN unix_timestamp('2021-06-09') AND unix_timestamp('2021-06-11') ORDER BY id DESC

  const paginate = " LIMIT ? OFFSET ?";

  const fullQuery = qs + paginate;

  const limit = 5;
  const page = Number(pages) || 1;
  const offset = (page - 1) * limit;

  return new Promise((resolve, reject) => {
    db.query(fullQuery, [id, id, limit, offset], (error, result) => {
      if (error) {
        return reject(error);
      } else {
        const qsCount = "SELECT COUNT(*) AS count FROM(" + qs + ") as count";
        db.query(qsCount, [id, id], (error, data) => {
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
  topUp,
  transfer,
  history
};
