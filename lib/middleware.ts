import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';
import { addCorsHeaders } from './cors';
import { JWTPayload } from './types';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
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

    const authenticatedReq = req as AuthenticatedRequest;
    (authenticatedReq as any).user = payload;

    return handler(authenticatedReq);
  };
}

export function withRole(requiredRole: 'admin' | 'member') {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (req.user!.role !== requiredRole) {
        const response = NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        return addCorsHeaders(response);
      }
      return handler(req);
    });
  };
}
