module.exports = function createError(message, status, data) {
  const err = new Error(message);
  err.status = status;
  err.data = data;
  return err;
};
