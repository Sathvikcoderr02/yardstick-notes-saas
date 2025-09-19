import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Note from '@/models/Note';
import Tenant from '@/models/Tenant';
import { withAuth } from '@/lib/middleware';
import { addCorsHeaders } from '@/lib/cors';
import { CreateNoteRequest } from '@/lib/types';

async function handleGET(req: NextRequest) {
  try {
    console.log('Starting GET /api/notes');
    await connectDB();
    console.log('Database connected successfully');

    const user = (req as any).user;
    console.log('User from token:', { userId: user.userId, tenantId: user.tenantId, email: user.email });
    
    const notes = await Note.find({ tenantId: user.tenantId }).sort({ createdAt: -1 });
    console.log(`Found ${notes.length} notes for tenant ${user.tenantId}`);

    const response = NextResponse.json({ notes });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Get notes error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

async function handlePOST(req: NextRequest) {
  try {
    await connectDB();

    const user = (req as any).user;
    const { title, content }: CreateNoteRequest = await req.json();

    if (!title || !content) {
      const response = NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
      return addCorsHeaders(response);
    }

    // Check subscription limits
    const tenant = await Tenant.findOne({ _id: user.tenantId });
    if (!tenant) {
      const response = NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      return addCorsHeaders(response);
    }

    if (tenant.subscription === 'free') {
      const noteCount = await Note.countDocuments({ tenantId: user.tenantId });
      if (noteCount >= tenant.noteLimit) {
        const response = NextResponse.json({ 
          error: 'Note limit reached. Please upgrade to Pro plan.',
          limitReached: true 
        }, { status: 403 });
        return addCorsHeaders(response);
      }
    }

    const note = new Note({
      title,
      content,
      tenantId: user.tenantId,
      createdBy: user.userId,
    });

    await note.save();

    const response = NextResponse.json({ note }, { status: 201 });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Create note error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

export const GET = withAuth(handleGET);
export const POST = withAuth(handlePOST);

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
