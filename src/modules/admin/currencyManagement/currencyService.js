const { currency } = require("../../../models");

const currencyService = {
    async createCurrency(data) {

        const { code, name, symbol } = data;

        if (!code || !name || !symbol) {
          const error = new Error("code, name, and symbol are required");
          error.statusCode = 400;
          throw error;
        }
        
        data.code = data.code.toUpperCase();
      
        if (data.code.length > 3) {
          const error = new Error("Currency code must be 3 characters max");
          error.statusCode = 400;
          throw error;
        }
      
        const exists = await currency.findOne({ where: { code: data.code } });
        if (exists) {
          const error = new Error("Currency already exists");
          error.statusCode = 409;
          throw error;
        }
      
        return await currency.create(data);
      }
      ,

  async getAllCurrencies(features) {
    const { count, rows } = await currency.findAndCountAll({
      ...features.options,
    });

    return {
      total: count,
      currencies: rows,
    };
  },

  async getCurrencyById(id) {
    const Currency = await currency.findByPk(id);
    if (!Currency) throw new Error("Currency not found");
    return Currency;
  },

  async updateCurrency(id, data) {
    const Currency = await currency.findByPk(id);
    if (!Currency) throw new Error("Currency not found");

    await Currency.update(data);
    return Currency;
  },

  async deleteCurrency(id) {
    const Currency = await currency.findByPk(id);
    if (!Currency) throw new Error("Currency not found");

    await Currency.destroy();
    return { message: "Currency deleted successfully" };
  },
};

module.exports = currencyService;