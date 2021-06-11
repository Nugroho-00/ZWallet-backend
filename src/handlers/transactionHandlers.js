/* eslint-disable camelcase */
const {
  responseStandard,
  writeResponsePaginated
} = require("../helpers/response");
const transactionModels = require("../models/transactionModels");

const topUp = async (req, res) => {
  try {
    const { id } = req.user;
    const { amount } = req.body;

    if (!amount) {
      return responseStandard(
        res,
        "This field can not be empty",
        {},
        400,
        false
      );
    } else if (Number(amount) < 10000) {
      return responseStandard(
        res,
        "The minimum amount is Rp10,000",
        {},
        400,
        false
      );
    }
    const result = await transactionModels.topUp(id, amount);
    if (result) {
      console.log(result);
      return responseStandard(
        res,
        "Balance added successfully!",
        {},
        200,
        true
      );
    }
  } catch (error) {
    console.log(error);
    return responseStandard(res, error.message, {}, 500, false);
  }
};

const transfer = async (req, res) => {
  try {
    const { id } = req.user;
    const { receiverPhone, amount, note } = req.body;

    if (!amount) {
      return responseStandard(
        res,
        "This field can not be empty",
        {},
        400,
        false
      );
    } else if (Number(amount) < 10000) {
      return responseStandard(
        res,
        "The minimum amount is Rp10,000",
        {},
        400,
        false
      );
    }
    const result = await transactionModels.transfer(
      id,
      receiverPhone,
      amount,
      note
    );
    if (result) {
      console.log(result);
      if (result.conflict) {
        return responseStandard(res, result.conflict, {}, 200, false);
      } else {
        return responseStandard(
          res,
          "Transfer was successful. The balance will be sent to the destination user!",
          {},
          200,
          true
        );
      }
    }
  } catch (error) {
    console.log(error);
    return responseStandard(res, error.message, {}, 500, false);
  }
};

const history = async (req, res) => {
  const { baseUrl, path, hostname, protocol } = req;
  try {
    const { id } = req.user;
    const { type, start, end, sort, pages } = req.query;

    const finalResult = await transactionModels.history(id, type, start, end, sort, pages);
    const { result, count, page, limit } = finalResult;
    const totalPage = Math.ceil(count / limit) || 1;

    const url =
      protocol + "://" + hostname + ":" + process.env.PORT + baseUrl + path;

    // const prev = page === 1 ? null : url + `?pages=${page - 1}`;
    // const next = page === totalPage ? null : url + `?pages=${page + 1}`;

    let prev, next;

    if (!type && !start && !end && !sort) {
      prev = page === 1 ? null : url + `?pages=${page - 1}`;
      next = page === totalPage ? null : url + `?pages=${page + 1}`;
    } else if (type && !start && !end && !sort) {
      prev = page === 1 ? null : url + `?type=${type}&pages=${page - 1}`;
      next = page === totalPage ? null : url + `?type=${type}&pages=${page + 1}`;
    } else if (!type && start && end && !sort) {
      prev = page === 1 ? null : url + `?start=${start}&end=${end}&pages=${page - 1}`;
      next = page === totalPage ? null : url + `?start=${start}&end=${end}&pages=${page + 1}`;
    } else if (!type && !start && !end && sort) {
      prev = page === 1 ? null : url + `?sort=${sort}&pages=${page - 1}`;
      next = page === totalPage ? null : url + `?sort=${sort}&pages=${page + 1}`;
    } else if (type && start && end && !sort) {
      prev = page === 1 ? null : url + `?type=${type}&start=${start}&end=${end}&pages=${page - 1}`;
      next = page === totalPage ? null : url + `?type=${type}&start=${start}&end=${end}&pages=${page + 1}`;
    } else if (!type && start && end && sort) {
      prev = page === 1 ? null : url + `?start=${start}&end=${end}&sort=${sort}&pages=${page - 1}`;
      next = page === totalPage ? null : url + `?start=${start}&end=${end}&sort=${sort}&pages=${page + 1}`;
    } else if (type && start && end && sort) {
      prev = page === 1 ? null : url + `?type=${type}&start=${start}&end=${end}&sort=${sort}&pages=${page - 1}`;
      next = page === totalPage ? null : url + `?type=${type}&start=${start}&end=${end}&sort=${sort}&pages=${page + 1}`;
    }

    const info = {
      count,
      page,
      totalPage,
      next,
      prev
    };
    return writeResponsePaginated(res, 200, info, result);
  } catch (error) {
    console.log(error);
    return responseStandard(res, error.message, {}, 500, false);
  }
};

const subscribe = async (req, res) => {
  try {
    const { id } = req.user;
    const { productId } = req.body;

    console.log(productId);

    if (!productId) {
      return responseStandard(
        res,
        "This field can not be empty",
        {},
        400,
        false
      );
    }
    const result = await transactionModels.subscribe(
      id,
      productId
    );
    if (result) {
      console.log(result);
      if (result.conflict) {
        return responseStandard(res, result.conflict, {}, 200, false);
      } else {
        return responseStandard(
          res,
          "You have successfully subscribed. Your balance will be deducted according to the price listed!",
          {},
          200,
          true
        );
      }
    }
  } catch (error) {
    return responseStandard(res, error.message, {}, 500, false);
  }
};

module.exports = { topUp, transfer, history, subscribe };
