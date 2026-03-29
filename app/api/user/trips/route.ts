import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserTrips } from '@/lib/auth-db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const trips = await getUserTrips(session.user.id);

    return NextResponse.json({
      trips,
    });
  } catch (error) {
    console.error('Failed to fetch user trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}
