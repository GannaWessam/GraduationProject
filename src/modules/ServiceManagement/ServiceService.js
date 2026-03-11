const { Service, currency,Receipts } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const { formatService } = require("./helpers/responseHelper");

// ================= GET ALL =================
async function getAllServicesService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search();
  apiFeature.options.include = [
    {
      model: currency,
      attributes: ["code"],
      required: false,
    },
  ];

  const services = await Service.findAll(apiFeature.options);
  const total = await Service.count();

  return PaginatedResponse.fromApiFeature(
    apiFeature,
    total,
    services.map(formatService),
    "Services fetched successfully",
  );
}

// ================= ADD =================
async function addService(serviceInfo, req) {
  const { name, priceEgyptian, priceOther, currencyId, receiptId,receiptIdOthers } = serviceInfo;

  if (!name || !priceEgyptian || !priceOther || !currencyId || !receiptId || !receiptIdOthers) {
    throw new Error("missing_required");
  }

  const Currency = await currency.findByPk(currencyId);
  if (!Currency) throw new Error("currency_not_found");

  const newService = await Service.create({
    name,
    priceEgyptian,
    priceOther,
    currencyId,
    receiptId,
    receiptIdOthers
  });

  req.audit.affectedThing = {
    _id: newService.serviceId,
    name: newService.name,
  };

  req.audit.message = "Service added successfully | تم إضافة الخدمة بنجاح";

  return formatService(newService);
}

// ================= GET BY ID =================
async function getServiceById(id) {
  const service = await Service.findByPk(id, {
    include: [{ model: currency, attributes: ["code"] }],
  });

  if (!service) throw new Error("not_found");

  return formatService(service);
}

// ================= UPDATE =================
async function updateService(id, updateInfo, req) {
  const { name, priceEgyptian, priceOther, currencyId,receiptId,receiptIdOthers } = updateInfo;

  const service = await Service.findByPk(id);
  if (!service) throw new Error("not_found");

  if (name) service.name = name;
  if (priceEgyptian) service.priceEgyptian = priceEgyptian;
  if (priceOther) service.priceOther = priceOther;

  if (currencyId) {
    const Currency = await currency.findByPk(currencyId);
    if (!Currency) throw new Error("currency_not_found");
    service.currencyId = currencyId;
  }
  if(receiptId){
    const receipt=await Receipts.findByPk(receiptId)
    if(!receipt)
      throw new Error("receipt_not_found")
    service.receiptId = receiptId
    service.priceEgyptian=receipt.totalAmount
  }
  if(receiptIdOthers) {
    const receipt=await Receipts.findByPk(receiptIdOthers)
    if(!receipt)
      throw new Error("receipt_not_found")
    const currencyCode = await currency.findOne({
      where :{code:receipt.currency}
    })
    if(!currencyCode)
      throw new Error("currency_not_found");
    service.receiptIdOthers = receiptIdOthers
    service.currencyId=currencyCode.currencyId
    service.priceOther=receipt.totalAmount
  }

  await service.save();

  req.audit.affectedThing = {
    _id: service.serviceId,
    name: service.name,
  };

  req.audit.message = "Service updated successfully | تم تحديث الخدمة بنجاح";

  return formatService(service);
}

// ================= DELETE =================
async function deleteService(id, req) {
  const service = await Service.findByPk(id);
  if (!service) throw new Error("not_found");

  const name = service.name;
  await service.destroy();

  req.audit.affectedThing = {
    _id: service.serviceId,
    name,
  };

  req.audit.message = "Service deleted successfully | تم حذف الخدمة بنجاح";
}

module.exports = {
  getAllServicesService,
  addService,
  getServiceById,
  updateService,
  deleteService,
};
