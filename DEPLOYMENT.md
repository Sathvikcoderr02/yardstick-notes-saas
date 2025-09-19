# Deployment Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/yardstick-notes
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

3. **Initialize the database:**
   ```bash
   npm run init-db
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Vercel Deployment

### Prerequisites
- MongoDB Atlas account (free tier available)
- Vercel account

### Steps

1. **Set up MongoDB Atlas:**
   - Create a new cluster
   - Create a database user
   - Whitelist all IPs (0.0.0.0/0) for development
   - Get your connection string

2. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Configure environment variables in Vercel:**
   - Go to your project dashboard
   - Settings > Environment Variables
   - Add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A strong secret key

4. **Initialize production database:**
   - Run the init script against your production MongoDB
   - Or manually create test accounts

## Test Accounts

| Email | Password | Role | Tenant |
|-------|----------|------|--------|
| admin@acme.test | password | Admin | Acme |
| user@acme.test | password | Member | Acme |
| admin@globex.test | password | Admin | Globex |
| user@globex.test | password | Member | Globex |

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `GET /api/notes` - List notes
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/tenants/:slug/upgrade` - Upgrade to Pro (Admin only)

## Testing

The application is designed to work with automated test scripts. All endpoints include CORS headers for cross-origin requests.
