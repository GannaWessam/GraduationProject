const logger = require("../Util/logger");

const methodToType = (method) => {
  switch (method) {
    case "GET": return "read";
    case "POST": return "modification";
    case "PUT":
    case "PATCH": return "edit";
    case "DELETE": return "delete";
    default: return "read";
  }
};

const getActorFromRequest = (req) => {
  if (req.userData) {
    return {
      _id: req.userData.id,
      email: req.userData.email,
      name: req.userData.name,
    };
  }

  if (req.user) {
    return {
      _id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    };
  }

  return undefined;
};

module.exports = (req, res, next) => {

  req.audit = {
    affectedUser: null,
    affectedThing: null,
    message: null
  };

  res.on("finish", async () => {
    try {

        if (req.method === "GET") return;
      const actor = getActorFromRequest(req);

      await logger.log({
        ip: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,

        user: actor || req.audit.user,

        type: methodToType(req.method),

        level: res.statusCode >= 400 ? "error" : "success",

        affectedUser: req.audit.affectedUser || undefined,
        affectedThing: req.audit.affectedThing || undefined,

        message:
          req.audit.message ||
          `${req.method} ${req.originalUrl} ${res.statusCode}`,

      });

    } catch (err) {
        console.error("Audit logging failed:", err.message);
    }
  });

  next();
};