exports.loggerMiddleware = function (req, res, next) {
  const now = new Date().toISOString(); // e.g. 2025-08-22T10:15:30.123Z
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
};
