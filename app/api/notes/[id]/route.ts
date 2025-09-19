import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Note from '@/models/Note';
import { addCorsHeaders } from '@/lib/cors';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { UpdateNoteRequest } from '@/lib/types';

export async function GET(req: NextRequest, context: { params: { id: string } }) {
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
    const note = await Note.findOne({ 
      _id: context.params.id, 
      tenantId: user.tenantId 
    });

    if (!note) {
      const response = NextResponse.json({ error: 'Note not found' }, { status: 404 });
      return addCorsHeaders(response);
    }

    const response = NextResponse.json({ note });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Get note error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
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
    const { title, content }: UpdateNoteRequest = await req.json();

    const note = await Note.findOne({ 
      _id: context.params.id, 
      tenantId: user.tenantId 
    });

    if (!note) {
      const response = NextResponse.json({ error: 'Note not found' }, { status: 404 });
      return addCorsHeaders(response);
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    await note.save();

    const response = NextResponse.json({ note });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Update note error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
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
    const note = await Note.findOneAndDelete({ 
      _id: context.params.id, 
      tenantId: user.tenantId 
    });

    if (!note) {
      const response = NextResponse.json({ error: 'Note not found' }, { status: 404 });
      return addCorsHeaders(response);
    }

    const response = NextResponse.json({ message: 'Note deleted successfully' });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Delete note error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
