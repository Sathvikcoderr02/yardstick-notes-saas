import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';
import { addCorsHeaders } from '@/lib/cors';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Login error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
