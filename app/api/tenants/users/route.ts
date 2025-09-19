import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { withAuth, withRole } from '@/lib/middleware';
import { addCorsHeaders } from '@/lib/cors';

async function handleGET(req: NextRequest) {
  try {
    await connectDB();

    const user = (req as any).user;
    const users = await User.find({ tenantId: user.tenantId })
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 });

    const response = NextResponse.json({ users });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Get users error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

export const GET = withRole('admin')(withAuth(handleGET));

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
