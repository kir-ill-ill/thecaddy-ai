/**
 * CaddyAI API Utilities
 * Common helpers for API routes
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { CaddyError, Errors, AppError } from './errors';
import { formatZodErrors } from './validation';

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: CaddyError | Error | unknown,
  defaultMessage: string = 'An unexpected error occurred'
): NextResponse<ApiResponse<never>> {
  // Log the error for debugging
  console.error('API Error:', error);

  if (error instanceof CaddyError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.userMessage,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    const formattedErrors = formatZodErrors(error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input. Please check your data and try again.',
          details: { validationErrors: formattedErrors },
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: defaultMessage,
          details: process.env.NODE_ENV === 'development' ? { errorMessage: error.message } : undefined,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: defaultMessage,
      },
    },
    { status: 500 }
  );
}

/**
 * Parse numeric search parameter with validation
 */
export function parseNumericParam(value: string | null, defaultValue?: number): number | undefined {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  return parsed;
}

/**
 * Parse float search parameter with validation
 */
export function parseFloatParam(value: string | null, defaultValue?: number): number | undefined {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return defaultValue;
  return parsed;
}

/**
 * Wrap an async handler with error catching
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiResponse<never>>> {
  return handler().catch((error) => errorResponse(error));
}

/**
 * Request ID generator for logging
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Logger with request context
 */
export function createLogger(requestId: string) {
  return {
    info: (message: string, data?: Record<string, unknown>) => {
      console.log(JSON.stringify({ level: 'info', requestId, message, ...data, timestamp: new Date().toISOString() }));
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      console.warn(JSON.stringify({ level: 'warn', requestId, message, ...data, timestamp: new Date().toISOString() }));
    },
    error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
      console.error(JSON.stringify({
        level: 'error',
        requestId,
        message,
        error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
        ...data,
        timestamp: new Date().toISOString(),
      }));
    },
  };
}
