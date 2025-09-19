# Yardstick Notes - Multi-Tenant SaaS Application

A multi-tenant SaaS Notes Application built with Next.js, MongoDB, and deployed on Vercel. The application supports multiple tenants with strict data isolation, role-based access control, and subscription-based feature gating.

## Features

- **Multi-Tenancy**: Support for multiple tenants (Acme and Globex) with strict data isolation
- **Authentication**: JWT-based authentication with role-based access control
- **Roles**: Admin (can invite users and upgrade subscriptions) and Member (can manage notes)
- **Subscription Management**: Free plan (3 notes limit) and Pro plan (unlimited notes)
- **Notes CRUD**: Full create, read, update, delete operations for notes
- **Tenant Isolation**: Data belonging to one tenant is never accessible to another
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Architecture

### Multi-Tenancy Approach: Shared Schema with Tenant ID

This application uses the **shared schema with tenant ID** approach for multi-tenancy:

- All collections (Users, Notes, Tenants) include a `tenantId` field
- Database queries are always filtered by `tenantId` to ensure data isolation
- Compound indexes on `tenantId` + other fields for efficient querying
- Middleware ensures all API requests are scoped to the authenticated user's tenant

### Database Schema

#### Tenants Collection
```typescript
{
  _id: ObjectId,
  name: string,           // "Acme Corporation"
  slug: string,           // "acme"
  subscription: string,   // "free" | "pro"
  noteLimit: number,      // 3 for free, -1 for unlimited
  createdAt: Date,
  updatedAt: Date
}
```

#### Users Collection
```typescript
{
  _id: ObjectId,
  email: string,          // Unique within tenant
  password: string,       // Hashed with bcrypt
  role: string,           // "admin" | "member"
  tenantId: string,       // References tenant._id
  createdAt: Date,
  updatedAt: Date
}
```

#### Notes Collection
```typescript
{
  _id: ObjectId,
  title: string,
  content: string,
  tenantId: string,       // References tenant._id
  createdBy: string,      // References user._id
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Health Check
- `GET /api/health` - Returns `{ "status": "ok" }`

### Notes Management
- `GET /api/notes` - List all notes for current tenant
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenant Management
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro plan (Admin only)

## Test Accounts

The application comes with pre-configured test accounts:

| Email | Password | Role | Tenant |
|-------|----------|------|--------|
| admin@acme.test | password | Admin | Acme |
| user@acme.test | password | Member | Acme |
| admin@globex.test | password | Admin | Globex |
| user@globex.test | password | Member | Globex |

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd yardstick-notes-saas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
MONGODB_URI=mongodb://localhost:27017/yardstick-notes
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

4. Initialize the database with test data:
```bash
npm run init-db
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Initialization

The `scripts/init-db.ts` script will:
- Create the Acme and Globex tenants
- Create the four test user accounts
- Set up proper indexes for tenant isolation

## Deployment on Vercel

### Prerequisites for Deployment

1. **MongoDB Atlas Account**: Set up a MongoDB Atlas cluster
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

### Deployment Steps

1. **Set up MongoDB Atlas**:
   - Create a new cluster
   - Create a database user
   - Whitelist Vercel's IP ranges (0.0.0.0/0 for development)
   - Get your connection string

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Configure Environment Variables in Vercel**:
   - Go to your project dashboard on Vercel
   - Navigate to Settings > Environment Variables
   - Add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A strong secret key for JWT signing

4. **Initialize Production Database**:
   - Run the database initialization script against your production MongoDB
   - Or manually create the test accounts through the API

### CORS Configuration

The application is configured to allow CORS requests from any origin for automated testing and dashboard access. This is handled by the Next.js API routes and doesn't require additional CORS middleware.

## Security Features

### Tenant Isolation
- All database queries include tenant ID filtering
- JWT tokens include tenant information
- Middleware validates tenant access on every request
- No cross-tenant data access is possible

### Authentication & Authorization
- JWT tokens with 24-hour expiration
- Password hashing with bcrypt
- Role-based access control (Admin/Member)
- Secure token validation on all protected routes

### Input Validation
- Required field validation
- Email format validation
- Content sanitization
- SQL injection prevention through Mongoose ODM

## Testing

The application is designed to work with automated test scripts. Key test scenarios:

1. **Health Endpoint**: `GET /api/health` returns `{ "status": "ok" }`
2. **Authentication**: All test accounts can log in successfully
3. **Tenant Isolation**: Data from one tenant is not accessible to another
4. **Role Restrictions**: Members cannot access admin-only endpoints
5. **Subscription Limits**: Free plan enforces 3-note limit
6. **Upgrade Functionality**: Admin can upgrade tenant to Pro plan
7. **CRUD Operations**: All note operations work correctly

## Project Structure

```
yardstick-notes-saas/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login/
│   │   ├── health/
│   │   ├── notes/
│   │   │   └── [id]/
│   │   └── tenants/
│   │       └── [slug]/
│   │           └── upgrade/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CreateNoteForm.tsx
│   ├── LoginForm.tsx
│   ├── NotesApp.tsx
│   ├── NotesList.tsx
│   └── UpgradePrompt.tsx
├── lib/
│   ├── auth.ts
│   ├── database.ts
│   ├── middleware.ts
│   └── types.ts
├── models/
│   ├── Note.ts
│   ├── Tenant.ts
│   └── User.ts
├── scripts/
│   └── init-db.ts
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Deployment**: Vercel
- **Styling**: Tailwind CSS

## License

This project is created for educational purposes as part of a technical assignment.
