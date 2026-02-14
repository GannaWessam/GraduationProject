const Log = require("../models/Log");

const logger = {
  log: async ({ ip, user, type, level, affectedUser,affectedThing, message, meta }) => {
    try {
      await Log.create({ ip, user, type, level, affectedUser, affectedThing,message, meta });
    } catch (err) {
      console.error("Failed to save log:", err);
    }
  },
  info: (opts) => logger.log({ ...opts, level: "success" }),
  error: (opts) => logger.log({ ...opts, level: "error" }),
};

module.exports = logger;