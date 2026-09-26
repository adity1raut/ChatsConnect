import winston from "winston";

const { combine, timestamp, errors, splat, json, colorize, printf } =
  winston.format;

// Readable single-line logs locally; structured JSON in production (Azure log stream)
const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} ${level}: ${stack || message}${extra}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  silent: process.env.NODE_ENV === "test",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    process.env.NODE_ENV === "production"
      ? json()
      : combine(colorize(), devFormat),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
