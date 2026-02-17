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


  return log;
}

module.exports = {
  getAllLogsService,
  getLogById,
};