export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  subscription: 'free' | 'pro';
  noteLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}
