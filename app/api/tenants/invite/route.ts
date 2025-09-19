import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { withAuth, withRole } from '@/lib/middleware';
import { addCorsHeaders } from '@/lib/cors';

async function handlePOST(req: NextRequest) {
  try {
    await connectDB();

    const user = (req as any).user;
    const { email, role } = await req.json();

    if (!email || !role) {
      const response = NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
      return addCorsHeaders(response);
    }

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      const response = NextResponse.json({ error: 'Invalid role. Must be admin or member' }, { status: 400 });
      return addCorsHeaders(response);
    }

    // Check if user already exists in this tenant
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      tenantId: user.tenantId 
    });

    if (existingUser) {
      const response = NextResponse.json({ error: 'User already exists in this tenant' }, { status: 409 });
      return addCorsHeaders(response);
    }

    // Create new user with default password
    const defaultPassword = 'password123'; // In a real app, this would be generated and sent via email
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashPassword(defaultPassword),
      role: role,
      tenantId: user.tenantId,
    });

    await newUser.save();

    const response = NextResponse.json({
      message: `User ${email} has been added to the tenant`,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
      },
      // In a real app, you wouldn't return the password
      tempPassword: defaultPassword,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error('Invite user error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

export const POST = withRole('admin')(withAuth(handlePOST));

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
