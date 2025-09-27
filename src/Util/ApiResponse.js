class ApiResponse {
  constructor(status, message = null, data = null, errors = null) {
    this.status = status;
    this.message = message || ApiResponse.getDefaultMessage(status);
    this.data = data;
    this.errors = errors;
  }

  static getDefaultMessage(status) {
    switch (status) {
      case 200:
        return "Success";
      case 201:
        return "Created";
      case 302:
        return "Redirect";
      case 400:
        return "Bad Request";
      case 401:
        return "Unauthorized";
      case 403:
        return "Forbidden";
      case 404:
        return "Resource not found!";
      case 500:
        return "Internal Server Error";
      case 502:
        return "Bad Gateway";
      case 503:
        return "Service Unavailable";
      default:
        return "Unknown Error";
    }
  }

  static success(data = null, message = null) {
    return new ApiResponse(200, message, data, null);
  }

  static created(data = null, message = null) {
    return new ApiResponse(201, message, data, null);
  }

  static error(status = 500, message = null, errors = null) {
    return new ApiResponse(status, message, null, errors);
  }
}

module.exports = ApiResponse;
