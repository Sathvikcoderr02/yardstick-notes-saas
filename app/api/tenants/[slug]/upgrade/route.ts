import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Tenant from '@/models/Tenant';
import { addCorsHeaders } from '@/lib/cors';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function POST(req: NextRequest, context: { params: { slug: string } }) {
  try {
    await connectDB();

    // Handle authentication
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      const response = NextResponse.json({ error: 'No token provided' }, { status: 401 });
      return addCorsHeaders(response);
    }

    const payload = verifyToken(token);
    if (!payload) {
      const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      return addCorsHeaders(response);
    }

    const user = payload;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      const response = NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      return addCorsHeaders(response);
    }

    const { slug } = context.params;

    // Find tenant by slug
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) {
      const response = NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      return addCorsHeaders(response);
    }

    // Verify user belongs to this tenant
    if (user.tenantId !== tenant._id.toString()) {
      const response = NextResponse.json({ error: 'Access denied' }, { status: 403 });
      return addCorsHeaders(response);
    }

    // Upgrade to Pro plan
    tenant.subscription = 'pro';
    tenant.noteLimit = -1; // Unlimited
    await tenant.save();

    const response = NextResponse.json({ 
      message: 'Tenant upgraded to Pro plan successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
        noteLimit: tenant.noteLimit,
      }
    });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
