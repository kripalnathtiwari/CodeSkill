const winston = require("winston");
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: "nonexistent_folder/error.log" })
  ]
});
logger.info("Test");
