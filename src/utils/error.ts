class AppError extends Error {
  public readonly statusCode: number;
  // public readonly errorCode?: string;
  public readonly details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    // this.errorCode = errorCode;
    this.details = details;
  }
}

export default AppError;
