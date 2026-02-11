// API Error codes and messages for better error handling
export enum ErrorCode {
  // Auth errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  INVALID_EMAIL = "INVALID_EMAIL",
  UNAUTHORIZED = "UNAUTHORIZED",

  // Profile errors
  PROFILE_NOT_FOUND = "PROFILE_NOT_FOUND",
  PROFILE_INVALID_DATA = "PROFILE_INVALID_DATA",

  // Resume errors
  RESUME_NOT_FOUND = "RESUME_NOT_FOUND",
  RESUME_GENERATION_FAILED = "RESUME_GENERATION_FAILED",
  AI_UNAVAILABLE = "AI_UNAVAILABLE",

  // File errors
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  FILE_PARSE_ERROR = "FILE_PARSE_ERROR",

  // API errors
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  REQUEST_TIMEOUT = "REQUEST_TIMEOUT",
  
  // Server errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: any;
}

export const errorMessages: Record<ErrorCode, { message: string; statusCode: number }> = {
  [ErrorCode.INVALID_CREDENTIALS]: {
    message: "Invalid email or password. Please try again.",
    statusCode: 401,
  },
  [ErrorCode.USER_ALREADY_EXISTS]: {
    message: "An account with this email already exists. Please login instead.",
    statusCode: 409,
  },
  [ErrorCode.WEAK_PASSWORD]: {
    message: "Password does not meet security requirements. Must contain uppercase, lowercase, number, and special character.",
    statusCode: 400,
  },
  [ErrorCode.INVALID_EMAIL]: {
    message: "This email address is invalid. Please check and try again.",
    statusCode: 400,
  },
  [ErrorCode.UNAUTHORIZED]: {
    message: "You must be logged in to access this resource.",
    statusCode: 401,
  },
  [ErrorCode.PROFILE_NOT_FOUND]: {
    message: "Profile not found. Please create a profile first.",
    statusCode: 404,
  },
  [ErrorCode.PROFILE_INVALID_DATA]: {
    message: "Invalid profile data provided. Please check your input.",
    statusCode: 400,
  },
  [ErrorCode.RESUME_NOT_FOUND]: {
    message: "Resume not found. It may have been deleted.",
    statusCode: 404,
  },
  [ErrorCode.RESUME_GENERATION_FAILED]: {
    message: "Failed to generate resume. Please try again in a moment.",
    statusCode: 500,
  },
  [ErrorCode.AI_UNAVAILABLE]: {
    message: "AI resume customization is temporarily unavailable. Your resume was generated using our template.",
    statusCode: 503,
  },
  [ErrorCode.FILE_TOO_LARGE]: {
    message: "File is too large. Maximum file size is 5MB.",
    statusCode: 413,
  },
  [ErrorCode.INVALID_FILE_TYPE]: {
    message: "Invalid file type. Please upload a PDF, DOCX, or TXT file.",
    statusCode: 415,
  },
  [ErrorCode.FILE_PARSE_ERROR]: {
    message: "Failed to parse the uploaded file. Please ensure it's a valid resume file.",
    statusCode: 400,
  },
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    message: "Too many requests. Please wait a moment before trying again.",
    statusCode: 429,
  },
  [ErrorCode.REQUEST_TIMEOUT]: {
    message: "Request took too long to process. Please try again.",
    statusCode: 408,
  },
  [ErrorCode.INTERNAL_ERROR]: {
    message: "An unexpected error occurred. Our team has been notified. Please try again later.",
    statusCode: 500,
  },
  [ErrorCode.DATABASE_ERROR]: {
    message: "A database error occurred. Please try again later.",
    statusCode: 500,
  },
};

export function createApiError(code: ErrorCode, details?: any): ApiError {
  const errorInfo = errorMessages[code];
  return {
    code,
    message: errorInfo.message,
    statusCode: errorInfo.statusCode,
    details,
  };
}
