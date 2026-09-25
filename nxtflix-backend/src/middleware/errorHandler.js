export function errorHandler(err, req, res, next) {
  console.error(err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({ message });
}
