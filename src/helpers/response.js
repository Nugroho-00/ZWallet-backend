module.exports = (
  response,
  message,
  aditionalData = {},
  status = 200,
  success = true
) => {
  return response.status(status).json({
    success,
    message: message || "Success",
    ...aditionalData,
  });
};
