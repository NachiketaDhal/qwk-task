import winston from "winston";
import appRoot from "app-root-path";

const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
  transports: [
    // Error log file
    new winston.transports.File({
      filename: `${appRoot}/logs/error.log`,
      format: combine(timestamp(), json()),
      level: "error",
    }),

    // Normal log file
    new winston.transports.File({
      filename: `${appRoot}/logs/combined.log`,
      level: "info",
      format: combine(timestamp(), json()),
      handleExceptions: true,
    }),
  ],
});

export default logger;
