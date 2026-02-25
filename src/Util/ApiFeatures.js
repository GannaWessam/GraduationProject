const { Op } = require("sequelize");
const { sequelize } = require("../models");

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
      date: "date",
    };
  
    const where = {};
  
    for (let key in queryObj) {
      const match = key.match(/([\w.]+)\[(\w+)\]/);
  
      if (match) {
        const field = match[1];
        const op = match[2];
        let value = queryObj[key];
        const sequelizeField = field.includes(".") ? `$${field}$` : field;
        if (op === "date") {
          const start = new Date(value);
          start.setHours(0, 0, 0, 0);
        
          const end = new Date(value);
          end.setHours(23, 59, 59, 999);
        
          where[sequelizeField] = {
            [Op.between]: [start, end],
          };
        
          continue;
        }
  
        if (!where[sequelizeField]) where[sequelizeField] = {};
  
        if (opMap[op]) {
          if (op === "in" || op === "nin") {
            if (typeof value === "string") value = value.split(",");
            where[sequelizeField][opMap[op]] = value;
          } 
          else if (op === "contains") {
            where[sequelizeField][opMap[op]] = `%${value}%`;
          } 
          else {
            where[sequelizeField][opMap[op]] = value;
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
        console.log(searchFields);
        

      if (searchFields.length > 0) {
        const orConditions = searchFields.map((field) => {
          if (field.includes(".")) {
            return sequelize.where(
              sequelize.cast(sequelize.col(field), "TEXT"),
              { [Op.iLike]: `%${this.searchQuery.search}%` }
            );
          } else {
            return {
              [field]: { [Op.iLike]: `%${this.searchQuery.search}%` },
            };
          }
        });

        this.options.where = {
          ...this.options.where,
          [Op.or]: orConditions,
        };
      }
    }

    return this;
  }
}

module.exports = ApiFeature;
