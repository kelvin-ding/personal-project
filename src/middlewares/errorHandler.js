module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const data = err.data || {};

  console.error(err);

  res.status(status).json({ status: "error", message, data });
};
