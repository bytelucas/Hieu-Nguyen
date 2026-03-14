export interface IAppException<T = unknown> {
  statusCode: number;
  message: string;
  messageProperties?: Record<string, string | number>;
  metadata?: Record<string, unknown>;
  data?: T;
}
