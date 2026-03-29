import { NextRequest, NextResponse } from 'next/server';
import { createVerificationToken, getUserByEmail, createUser } from '@/lib/auth-db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists, create if not
    let user = await getUserByEmail(email);
    if (!user) {
      user = await createUser({ email });
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await createVerificationToken({
      identifier: email,
      token,
      expires,
    });

    // Build magic link URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // In production, send email here
    // For now, return the link (dev mode)
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        message: 'Magic link generated',
        // Only in dev - remove in production
        magicLink,
      });
    }

    // TODO: Implement email sending with Resend, SendGrid, etc.
    // await sendMagicLinkEmail(email, magicLink);

    return NextResponse.json({
      success: true,
      message: 'Check your email for the login link',
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { error: 'Failed to generate magic link' },
      { status: 500 }
    );
  }
}
