class PaginatedResponse {
  constructor(data, paginationInfo, message = "Data fetched successfully") {
    this.status = 200;
    this.message = message;
    this.data = data;
    this.pagination = {
      page: paginationInfo.page,
      limit: paginationInfo.limit,
      total: paginationInfo.total,
      totalPages: paginationInfo.totalPages,
      hasNext: paginationInfo.page < paginationInfo.totalPages,
      hasPrev: paginationInfo.page > 1,
      nextPage: paginationInfo.page < paginationInfo.totalPages ? paginationInfo.page + 1 : null,
      prevPage: paginationInfo.page > 1 ? paginationInfo.page - 1 : null
    };
  }

  static create(data, paginationInfo, message) {
    return new PaginatedResponse(data, paginationInfo, message);
  }

  // Helper method to create pagination info from ApiFeature and count
  static fromApiFeature(apiFeature, totalCount, data, message) {
    const paginationInfo = {
      page: apiFeature.page,
      limit: apiFeature.limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / apiFeature.limit)
    };
    
    return new PaginatedResponse(data, paginationInfo, message);
  }
}

module.exports = PaginatedResponse;
