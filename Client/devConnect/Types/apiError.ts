interface ApiError {
  message?: string;
  // You can extend this if your API error has more fields
  status?: number;
  code?: string;
}
export default ApiError;
