const responseStandard = (
  response,
  message,
  aditionalData = {},
  status = 200,
  success = true
) => {
  response.status(status).json({
    success,
    message: message || "Success",
    ...aditionalData,
  });
};

const writeResponsePaginated = (res, status, info, result) => {
  let response = {};
  if (result) {
    response = {
      ...response,
      result,
    };
  }
  if (info) {
    response = {
      info,
      ...response,
    };
  }
  res.status(status).json(response);
};
module.exports = {
  responseStandard,
  writeResponsePaginated,
};
