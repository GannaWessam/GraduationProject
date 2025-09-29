const { Op } = require("sequelize");


class ApiFeature {
  constructor(searchQuery) {
    this.searchQuery = searchQuery;
    this.options = {};
  }

  pagination(defaultLimit = 10) {
    const page = Math.max(Number(this.searchQuery.page) || 1, 1);
    const limit = Number(this.searchQuery.limit) || defaultLimit;
    const offset = (page - 1) * limit;

    this.page = page;
    this.limit = limit;

    this.options.limit = limit;
    this.options.offset = offset;

    return this;
  }
  filter() {
    let queryObj = { ...this.searchQuery };

    const excluded = [
      "page",
      "limit",
      "sort",
      "fields",
      "search",
      "searchFields",
    ];
    excluded.forEach((el) => delete queryObj[el]);

    const opMap = {
      gt: Op.gt,
      gte: Op.gte,
      lt: Op.lt,
      lte: Op.lte,
      in: Op.in,
      nin: Op.notIn,
      eq: Op.eq,
      ne: Op.ne,
      contains: Op.iLike,
    };

    const where = {};
    for (let key in queryObj) {
      const match = key.match(/(\w+)\[(\w+)\]/);
      if (match) {
        const field = match[1];
        const op = match[2];

        if (!where[field]) where[field] = {};

        if (opMap[op]) {
          if (op === "contains") {
            where[field][opMap[op]] = `%${queryObj[key]}%`;
          } else {
            where[field][opMap[op]] = queryObj[key];
          }
        }
      } else {
        where[key] = queryObj[key];
      }
    }

    this.options.where = where;

    return this;
  }

  sort() {
    if (this.searchQuery.sort) {
      const sortBy = this.searchQuery.sort.split(",").map((field) => {
        if (field.startsWith("-")) {
          return [field.substring(1), "DESC"];
        }
        return [field, "ASC"];
      });
      this.options.order = sortBy;
    } else {
      this.options.order = [["createdAt", "DESC"]];
    }
    return this;
  }

  selectedFields() {
    if (this.searchQuery.fields) {
      this.options.attributes = this.searchQuery.fields.split(",");
    }
    return this;
  }

  search() {
    if (this.searchQuery.search) {
      const searchFields = this.searchQuery.searchFields
        ? this.searchQuery.searchFields.split(",")
        : [];

      if (searchFields.length > 0) {
        this.options.where = {
          ...this.options.where,
          [Op.or]: searchFields.map((field) => ({
            [field]: { [Op.iLike]: `%${this.searchQuery.search}%` },
          })),
        };
      }
    }
    return this;
  }
}


module.exports = ApiFeature;