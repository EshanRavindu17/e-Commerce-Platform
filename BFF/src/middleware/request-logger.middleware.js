const logger = console;

const buildRequestId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const requestLoggerMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || buildRequestId();
  const startedAt = Date.now();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  logger.info("BFF Request", {
    requestId,
    method: req.method,
    path: req.originalUrl,
  });

  res.on("finish", () => {
    logger.info("BFF Response", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
};

export default requestLoggerMiddleware;
