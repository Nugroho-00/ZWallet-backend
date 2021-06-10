const { responseStandard } = require("../helpers/response");
const notificationModels = require("../models/notificationModels");

const postNotification = async (req, res) => {
  try {
    const { id } = req.user;
    const result = await notificationModels.postNotification(id);
    if (result) {
      console.log(result);
      return responseStandard(
        res,
        "Notification stored!",
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

const getNotification = async (req, res) => {
  try {
    const { id } = req.user;
    const result = await notificationModels.getNotification(id);
    if (result) {
      console.log(result);
      return responseStandard(
        res,
        "",
        { result },
        200,
        true
      );
    }
  } catch (error) {
    console.log(error);
    return responseStandard(res, error.message, {}, 500, false);
  }
};

module.exports = {
  postNotification,
  getNotification
};
