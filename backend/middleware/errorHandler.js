import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

// 404 for anything no router matched
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Last middleware: every thrown or next(err) error ends up here as JSON.
// Express 5 forwards rejected promises from async handlers automatically.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = 500;
  let message = "Something went wrong. Please try again.";
  let details;

  if (err instanceof ApiError) {
    ({ status, message, details } = err);
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large";
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed JSON body";
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = Object.values(err.errors)[0]?.message || "Validation failed";
  }

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} failed`, err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}
