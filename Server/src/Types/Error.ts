// types/AppError.ts
export interface AppError extends Error {
  status?: number;
  message: string;
  errors?: Record<string, unknown>;
}
