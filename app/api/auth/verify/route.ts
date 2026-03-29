import { NextRequest, NextResponse } from 'next/server';
import { useVerificationToken, getUserByEmail, updateUser } from '@/lib/auth-db';
import { signIn } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
    }

    // Verify token
    const verificationToken = await useVerificationToken({
      identifier: email,
      token,
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
    }

    // Check if token expired
    if (new Date(verificationToken.expires) < new Date()) {
      return NextResponse.redirect(new URL('/login?error=TokenExpired', request.url));
    }

    // Get user and mark email as verified
    const user = await getUserByEmail(email);
    if (user) {
      await updateUser(user.id, { email_verified: new Date() });
    }

    // Redirect to a callback page that will sign in the user
    return NextResponse.redirect(
      new URL(`/auth/callback?email=${encodeURIComponent(email)}`, request.url)
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(new URL('/login?error=VerificationFailed', request.url));
  }
}
