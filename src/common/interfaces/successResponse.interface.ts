export interface SuccessResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
