function formatService(service) {
  return {
    id: service.serviceId,
    name: service.name,
    priceEgyptian: service.priceEgyptian,
    priceOther: service.priceOther,
    currency: service.currency?.code || null,
    currencyId: service.currencyId,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    receiptId:service.receiptId,
    receiptIdOthers:service.receiptIdOthers
  };
}

module.exports = { formatService };
