export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  method: string;
  timestamp: string;
}
