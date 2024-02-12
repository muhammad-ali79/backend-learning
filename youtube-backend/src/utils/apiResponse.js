class ApiResponse {
  constructor(statusCode, data, message = "success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    // return ture if the status is below 400
    this.success = statusCode < 400;
  }
}

export default ApiResponse;
