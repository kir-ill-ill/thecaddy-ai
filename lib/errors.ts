/**
 * CaddyAI Error Handling System
 * Provides structured errors with codes, logging, and user-friendly messages
 */

export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INVALID_BUDGET = 'INVALID_BUDGET',

  // Authentication/Authorization (401/403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Not found (404)
  TRIP_NOT_FOUND = 'TRIP_NOT_FOUND',
  DESTINATION_NOT_FOUND = 'DESTINATION_NOT_FOUND',
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server errors (500)
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  PLANNING_ERROR = 'PLANNING_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

export class CaddyError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage?: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CaddyError';
    this.code = code;
    this.statusCode = statusCode || this.getDefaultStatusCode(code);
    this.userMessage = userMessage || this.getDefaultUserMessage(code);
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    Error.captureStackTrace(this, CaddyError);
  }

  private getDefaultStatusCode(code: ErrorCode): number {
    const statusMap: Record<ErrorCode, number> = {
      [ErrorCode.VALIDATION_ERROR]: 400,
      [ErrorCode.INVALID_INPUT]: 400,
      [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
      [ErrorCode.INVALID_DATE_RANGE]: 400,
      [ErrorCode.INVALID_BUDGET]: 400,
      [ErrorCode.UNAUTHORIZED]: 401,
      [ErrorCode.FORBIDDEN]: 403,
      [ErrorCode.TRIP_NOT_FOUND]: 404,
      [ErrorCode.DESTINATION_NOT_FOUND]: 404,
      [ErrorCode.COURSE_NOT_FOUND]: 404,
      [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
      [ErrorCode.DATABASE_ERROR]: 500,
      [ErrorCode.INTERNAL_ERROR]: 500,
      [ErrorCode.PLANNING_ERROR]: 500,
    };
    return statusMap[code] || 500;
  }

  private getDefaultUserMessage(code: ErrorCode): string {
    const messageMap: Record<ErrorCode, string> = {
      [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
      [ErrorCode.INVALID_INPUT]: 'The provided input is invalid.',
      [ErrorCode.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
      [ErrorCode.INVALID_DATE_RANGE]: 'Please select valid dates for your trip.',
      [ErrorCode.INVALID_BUDGET]: 'Please enter a valid budget amount.',
      [ErrorCode.UNAUTHORIZED]: 'Please sign in to continue.',
      [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
      [ErrorCode.TRIP_NOT_FOUND]: 'This trip could not be found.',
      [ErrorCode.DESTINATION_NOT_FOUND]: 'This destination could not be found.',
      [ErrorCode.COURSE_NOT_FOUND]: 'This course could not be found.',
      [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment.',
      [ErrorCode.DATABASE_ERROR]: 'A database error occurred. Please try again.',
      [ErrorCode.INTERNAL_ERROR]: 'Something went wrong. Please try again.',
      [ErrorCode.PLANNING_ERROR]: 'Unable to generate trip options. Please try again.',
    };
    return messageMap[code] || 'An unexpected error occurred.';
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// Error factory functions for common cases
export const Errors = {
  validation: (message: string, details?: Record<string, unknown>) =>
    new CaddyError(ErrorCode.VALIDATION_ERROR, message, undefined, 400, details),

  missingField: (field: string) =>
    new CaddyError(
      ErrorCode.MISSING_REQUIRED_FIELD,
      `Missing required field: ${field}`,
      `Please provide ${field}.`,
      400,
      { field }
    ),

  invalidInput: (field: string, reason: string) =>
    new CaddyError(
      ErrorCode.INVALID_INPUT,
      `Invalid ${field}: ${reason}`,
      `Please check your ${field} and try again.`,
      400,
      { field, reason }
    ),

  tripNotFound: (id: string) =>
    new CaddyError(
      ErrorCode.TRIP_NOT_FOUND,
      `Trip not found: ${id}`,
      'This trip could not be found. It may have been deleted.',
      404,
      { tripId: id }
    ),

  destinationNotFound: (id: number) =>
    new CaddyError(
      ErrorCode.DESTINATION_NOT_FOUND,
      `Destination not found: ${id}`,
      undefined,
      404,
      { destinationId: id }
    ),

  databaseError: (operation: string, originalError?: Error) =>
    new CaddyError(
      ErrorCode.DATABASE_ERROR,
      `Database error during ${operation}: ${originalError?.message || 'Unknown'}`,
      undefined,
      500,
      { operation }
    ),

  planningError: (reason: string) =>
    new CaddyError(
      ErrorCode.PLANNING_ERROR,
      `Planning failed: ${reason}`,
      'We were unable to generate trip options. Please adjust your criteria.',
      500,
      { reason }
    ),

  rateLimited: () =>
    new CaddyError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded',
      'You are making too many requests. Please wait a moment.',
      429
    ),
};
