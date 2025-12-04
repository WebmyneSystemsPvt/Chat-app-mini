const winston = require("winston");
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors, json } = format;
const path = require("path");
const fs = require("fs");
const DailyRotateFile = require("winston-daily-rotate-file");

const LOG_ENABLED =
  process.env.LOG_ENABLED === "true" || process.env.ENABLE_LOGS === "true";

const ensureDirSync = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating logs directory:", error);
    throw error;
  }
};

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  const formattedMessage = stack || message;
  return `${timestamp} [${level}]: ${formattedMessage}`;
});

const initializeLogger = () => {
  try {
    const logsDir = path.join(process.cwd(), "logs");
    ensureDirSync(logsDir);

    const logLevel =
      process.env.LOGGER_LEVEL ||
      (process.env.NODE_ENV === "development" ? "debug" : "info");

    const logFormat = combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      json()
    );

    const createDailyTransport = (level) =>
      new DailyRotateFile({
        filename: path.join(logsDir, `${level}-%DATE%.log`),
        datePattern: "YYYY-MM-DD",
        level,
        zippedArchive: true,
        maxSize: "10m",
        maxFiles: "14d",
        format: logFormat,
      });

    const logger = createLogger({
      levels,
      level: logLevel,
      defaultMeta: { service: "chat-app" },
      transports: LOG_ENABLED
        ? [
            createDailyTransport("error"),
            createDailyTransport("warn"),
            createDailyTransport("info"),
            createDailyTransport("http"),
            createDailyTransport("debug"),
          ]
        : [],
      exceptionHandlers: LOG_ENABLED
        ? [createDailyTransport("exceptions")]
        : [],
      exitOnError: false,
    });

    if (LOG_ENABLED && process.env.NODE_ENV === "development") {
      logger.add(
        new transports.Console({
          format: combine(
            colorize({ all: true }),
            timestamp({ format: "HH:mm:ss" }),
            consoleFormat
          ),
        })
      );
    }

    if (!LOG_ENABLED) {
      return {
        error: () => {},
        warn: () => {},
        info: () => {},
        http: () => {},
        debug: () => {},
      };
    }

    return logger;
  } catch (error) {
    console.error("Failed to initialize logger:", error);
    return {
      error: (...args) => console.error("ERROR:", ...args),
      warn: (...args) => console.warn("WARN:", ...args),
      info: (...args) => console.log("INFO:", ...args),
      http: (...args) => console.log("HTTP:", ...args),
      debug: (...args) => console.debug("DEBUG:", ...args),
    };
  }
};

const loggerInstance = initializeLogger();

const getLogger = () => loggerInstance;

const stream = {
  write: (message) => {
    if (LOG_ENABLED) {
      getLogger().http(message.trim());
    }
  },
};

module.exports = { getLogger, stream };
