const currencyService = require("./currencyService");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

const currencyController = {
  async create(req, res) {
    const currency = await currencyService.createCurrency(req.body);
    res.status(201).json(ApiResponse.success(currency));
  },

  async getAll(req, res) {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();

    const currencies = await currencyService.getAllCurrencies(features);
    res.status(200).json(ApiResponse.success(currencies));
  },

  async getById(req, res) {
    const currency = await currencyService.getCurrencyById(req.params.id);
    res.status(200).json(ApiResponse.success(currency));
  },

  async update(req, res) {
    const currency = await currencyService.updateCurrency(
      req.params.id,
      req.body
    );
    res.status(200).json(ApiResponse.success(currency));
  },

  async delete(req, res) {
    const result = await currencyService.deleteCurrency(req.params.id);
    res.status(200).json(ApiResponse.success(result));
  },
};

module.exports = currencyController;