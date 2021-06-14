/* eslint-disable camelcase */
const db = require("../database/dbMysql");

const topUp = (virtual_account, amount) => {
  // // const transaction_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return new Promise((resolve, reject) => {
    const findId = "SELECT id FROM users WHERE virtual_account = ?";
    db.query(findId, virtual_account, (error, result) => {
      if (error) {
        return reject(error);
      } else if (result.length === 0) {
        resolve({ conflict: "User not found" });
      } else {
        const id = result[0].id;
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
                    type: "topup",
                    executor_id: id
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
                    type: "topup",
                    executor_id: id

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
      }
    });
  });
};

const transfer = (sender, phone, amount, note) => {
  // const transaction_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

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
                executor_id: sender

              };

              const dataReceiver = {
                sender_id: sender,
                receiver_id: receiver,
                nominal: amount,
                type: "debit",
                note: note,
                executor_id: receiver

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

const history = (id, type, start, end, sort, pages, limits) => {
  let qs = "SELECT t.id as transaction_id, s.username as 'sender', IF(t.type='subscription', p.name, r.username) as receiver, IF(t.type='credit', r.avatar, IF(t.type='subscription',p.avatar, s.avatar)) as image, t.nominal, t.type, t.note, t.created_at FROM transactions t JOIN users s ON t.sender_id = s.id LEFT JOIN users r ON t.receiver_id = r.id LEFT JOIN products p ON t.receiver_id = p.id WHERE t.executor_id=?";

  // const qs2 = " GROUP BY transaction_id ";

  let filter = false;
  if (type) {
    filter = " AND type = '" + type + "'";
  }

  let range = false;
  if (start && end) {
    range = " AND created_at BETWEEN '" + start + "' AND '" + end + "'";
  }

  let order = false;
  if (sort) {
    const ordered = sort.split("-");
    if (ordered[0] === "date") {
      if (ordered[1] === "AZ") {
        order = " ORDER BY created_at ASC ";
      } else if (ordered[1] === "ZA") {
        order = " ORDER BY created_at DESC ";
      } else {
        order = false;
      }
    } else if (ordered[0] === "amount") {
      if (ordered[1] === "AZ") {
        order = " ORDER BY nominal ASC ";
      } else if (ordered[1] === "ZA") {
        order = " ORDER BY nominal DESC ";
      } else {
        order = false;
      }
    }
  }

  if (!filter && !range && !order) {
    // qs = qs + qs2 + " ORDER BY created_at DESC ";
    qs = qs + " ORDER BY created_at DESC ";
  } else if (filter && !range && !order) {
    // qs = qs + filter + qs2 + " ORDER BY created_at DESC ";
    qs = qs + filter + " ORDER BY created_at DESC ";
  } else if (!filter && range && !order) {
    // qs = qs + range + qs2 + " ORDER BY created_at DESC ";
    qs = qs + range + " ORDER BY created_at DESC ";
  } else if (!filter && !range && order) {
    // qs = qs + qs2 + order;
    qs = qs + order;
  } else if (filter && range && !order) {
    // qs = qs + filter + range + qs2 + " ORDER BY created_at DESC ";
    qs = qs + filter + range + " ORDER BY created_at DESC ";
  } else if (!filter && range && order) {
    // qs = qs + range + qs2 + order;
    qs = qs + range + order;
  } else if (filter && range && order) {
    // qs = qs + filter + range + qs2 + order;
    qs = qs + filter + range + order;
  }

  const paginate = " LIMIT ? OFFSET ?";

  const fullQuery = qs + paginate;

  const limit = Number(limits) || 5;
  const page = Number(pages) || 1;
  const offset = (page - 1) * limit;

  return new Promise((resolve, reject) => {
    db.query(fullQuery, [id, limit, offset], (error, result) => {
      if (error) {
        return reject(error);
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

const detail = (id) => {
  const qs = "SELECT t.id as transaction_id, s.username as 'sender', IF(t.type='subscription', p.name, r.username) as receiver, IF(t.type='credit', r.avatar, IF(t.type='subscription',p.avatar, s.avatar)) as image, t.nominal, t.type, t.note, t.created_at FROM transactions t JOIN users s ON t.sender_id = s.id LEFT JOIN users r ON t.receiver_id = r.id LEFT JOIN products p ON t.receiver_id = p.id WHERE t.id= ?";
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

const subscribe = (id, productId) => {
  // const transaction_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // let productName;
  let price, senderBalance;
  return new Promise((resolve, reject) => {
    const checkPrice = "SELECT name, price from products WHERE id = ? ";
    db.query(checkPrice, productId, (error, result) => {
      if (error) {
        return reject(error);
      } else if (result.length === 0) {
        return resolve({ conflict: "Sorry. Product ID not recognized" });
      } else {
        price = result[0].price;
        // productName = result[0].name;

        // Check sender balance
        const getPrevBalance = "SELECT balance_nominal FROM balances WHERE user_id = ?";
        db.query(getPrevBalance, id, (error, result) => {
          if (error) {
            return reject(error);
          } else if (result.length > 0) {
            senderBalance = Number(result[0].balance_nominal);
            if (senderBalance >= price) {
              const dataSender = {
                sender_id: id,
                receiver_id: productId,
                nominal: price,
                type: "subscription",
                executor_id: id
              };

              const dataReceiver = {
                product_id: productId,
                executor_id: id,
                status: "active"
              };

              const addTransaction = "INSERT INTO transactions SET ?";
              db.query(addTransaction, dataSender, (error, result) => {
                if (error) {
                  return reject(error);
                } else {
                  const data = {
                    balance_nominal: senderBalance - Number(price)
                  };

                  const updateBalance = "UPDATE balances SET ? WHERE user_id = ?";
                  db.query(updateBalance, [data, id], (error, result) => {
                    if (error) {
                      return reject(error);
                    } else {
                      const addSubcription = "INSERT INTO subscriptions SET ?";
                      db.query(addSubcription, dataReceiver, (error, result) => {
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

module.exports = {
  topUp,
  transfer,
  history,
  detail,
  subscribe
};
