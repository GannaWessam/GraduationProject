const { currency } = require("../../../models");

const currencyService = {
  async createCurrency(data, req) {

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
      
        const created = await currency.create(data);

        if (req && req.audit) {
          req.audit.affectedThing = {
            _id: created.currencyId,
            code: created.code,
          };
          req.audit.message =
            "Currency created successfully | تم إنشاء العملة بنجاح";
        }

        return created;
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

  async updateCurrency(id, data, req) {
    const Currency = await currency.findByPk(id);
    if (!Currency) throw new Error("Currency not found");

    await Currency.update(data);

    if (req && req.audit) {
      req.audit.affectedThing = {
        _id: Currency.currencyId,
        code: Currency.code,
      };
      req.audit.message =
        "Currency updated successfully | تم تحديث العملة بنجاح";
    }

    return Currency;
  },

  async deleteCurrency(id, req) {
    const Currency = await currency.findByPk(id);
    if (!Currency) throw new Error("Currency not found");

    await Currency.destroy();

    if (req && req.audit) {
      req.audit.affectedThing = {
        _id: Currency.currencyId,
        code: Currency.code,
      };
      req.audit.message =
        "Currency deleted successfully | تم حذف العملة بنجاح";
    }

    return { message: "Currency deleted successfully" };
  },
};

module.exports = currencyService;