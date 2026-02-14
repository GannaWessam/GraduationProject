const Log = require("../../models/Log");
const MongoApiFeature = require("../../Util/MongoApiFeature");
const logger = require("../../Util/logger");

async function getAllLogsService(reqQuery = {}, reqUser, reqIp) {
  const feature = new MongoApiFeature(reqQuery, Log)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search();

  const { data, total } = await feature.exec();

  await logger.info({
    ip: reqIp,
    user: {
      _id: reqUser?.id,
      email: reqUser?.email,
      name: reqUser?.name,
    },
    type: "read",
    message: "Fetched logs list",
  });

  return {
    page: feature.page,
    totalPages: Math.ceil(total / feature.limit),
    totalItems: total,
    items: data,
  };
}

async function getLogById(id, reqUser, reqIp) {
  const log = await Log.findById(id).lean();
  if (!log) throw new Error("not_found");

  await logger.info({
    ip: reqIp,
    user: {
      _id: reqUser?.id,
      email: reqUser?.email,
      name: reqUser?.name,
    },
    type: "read",
    affectedThing: {
      _id: id,
      name: "Log Record",
    },
    message: "Fetched log by id",
  });

  return log;
}

module.exports = {
  getAllLogsService,
  getLogById,
};