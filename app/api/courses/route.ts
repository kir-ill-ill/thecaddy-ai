import { NextRequest, NextResponse } from 'next/server';
import { getCoursesByDestination, getTopCourses, getCoursesWithDestination } from '@/lib/db';
import { CourseQuerySchema, validateInput, formatZodErrors } from '@/lib/validation';
import { CaddyError } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger, parseNumericParam } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// GET /api/courses - List courses (all, by destination, or top rated)
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { searchParams } = new URL(req.url);
    const destinationIdRaw = searchParams.get('destinationId');
    const topRaw = searchParams.get('top');

    // Validate query parameters
    const validation = validateInput(CourseQuerySchema, {
      destinationId: destinationIdRaw ? parseInt(destinationIdRaw, 10) : undefined,
      top: topRaw ? parseInt(topRaw, 10) : undefined,
    });

    if (!validation.success) {
      logger.warn('Validation failed', { errors: formatZodErrors(validation.error) });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters.',
            details: { validationErrors: formatZodErrors(validation.error) },
          },
        },
        { status: 400 }
      );
    }

    const { destinationId, top } = validation.data;

    if (destinationId) {
      // Get courses for a specific destination
      logger.info('Fetching courses by destination', { destinationId });
      const courses = await getCoursesByDestination(destinationId);
      return NextResponse.json({
        success: true,
        data: { courses },
      });
    }

    if (top) {
      // Get top N courses
      logger.info('Fetching top courses', { limit: top });
      const courses = await getTopCourses(top);
      return NextResponse.json({
        success: true,
        data: { courses },
      });
    }

    // Return all courses with destination info
    logger.info('Fetching all courses');
    const courses = await getCoursesWithDestination();
    return NextResponse.json({
      success: true,
      data: { courses },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Courses error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to fetch courses. Please try again.');
  }
}
