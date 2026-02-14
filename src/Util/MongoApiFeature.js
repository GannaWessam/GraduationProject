class MongoApiFeature {
  constructor(query, model) {
    this.query = query;
    this.model = model;
    this.mongoQuery = model.find();
  }

  // ---------------- PAGINATION ----------------
  pagination(defaultLimit = 10) {
    const page = Math.max(Number(this.query.page) || 1, 1);
    const limit = Number(this.query.limit) || defaultLimit;
    const skip = (page - 1) * limit;

    this.page = page;
    this.limit = limit;

    this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);
    return this;
  }

  // ---------------- FILTER ----------------
  filter() {
    const queryObj = { ...this.query };
    const excluded = ["page", "limit", "sort", "fields", "search", "searchFields"];
    excluded.forEach((el) => delete queryObj[el]);

    const filter = {};

    for (let key in queryObj) {
      const match = key.match(/([\w.]+)\[(\w+)\]/);

      if (match) {
        const field = match[1];
        const op = match[2];
        const value = queryObj[key];

        const mongoOps = {
          gt: "$gt",
          gte: "$gte",
          lt: "$lt",
          lte: "$lte",
          ne: "$ne",
          in: "$in",
          nin: "$nin",
        };

        if (!filter[field]) filter[field] = {};

        if (mongoOps[op]) {
          filter[field][mongoOps[op]] =
            op === "in" || op === "nin" ? value.split(",") : value;
        }
      } else {
        filter[key] = queryObj[key];
      }
    }

    this.mongoQuery = this.mongoQuery.find(filter);
    return this;
  }

  // ---------------- SORT ----------------
  sort() {
    if (this.query.sort) {
      const sortBy = this.query.sort.split(",").join(" ");
      this.mongoQuery = this.mongoQuery.sort(sortBy);
    } else {
      this.mongoQuery = this.mongoQuery.sort("-createdAt");
    }
    return this;
  }

  // ---------------- SELECT FIELDS ----------------
  selectedFields() {
    if (this.query.fields) {
      const fields = this.query.fields.split(",").join(" ");
      this.mongoQuery = this.mongoQuery.select(fields);
    }
    return this;
  }

  // ---------------- SEARCH ----------------
  search() {
    if (this.query.search && this.query.searchFields) {
      const keyword = this.query.search;
      const fields = this.query.searchFields.split(",");

      const or = fields.map((field) => ({
        [field]: { $regex: keyword, $options: "i" },
      }));

      this.mongoQuery = this.mongoQuery.find({ $or: or });
    }
    return this;
  }

  async exec() {
    const data = await this.mongoQuery.lean();
    const total = await this.model.countDocuments();
    return { data, total };
  }
}

module.exports = MongoApiFeature;