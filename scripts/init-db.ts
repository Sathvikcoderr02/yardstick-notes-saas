import connectDB from '../lib/database';
import User from '../models/User';
import Tenant from '../models/Tenant';
import { hashPassword } from '../lib/auth';

async function initializeDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Create tenants
    const acmeTenant = await Tenant.findOneAndUpdate(
      { slug: 'acme' },
      {
        name: 'Acme Corporation',
        slug: 'acme',
        subscription: 'free',
        noteLimit: 3,
      },
      { upsert: true, new: true }
    );

    const globexTenant = await Tenant.findOneAndUpdate(
      { slug: 'globex' },
      {
        name: 'Globex Corporation',
        slug: 'globex',
        subscription: 'free',
        noteLimit: 3,
      },
      { upsert: true, new: true }
    );

    console.log('Created tenants:', { acmeTenant: acmeTenant._id, globexTenant: globexTenant._id });

    // Create users
    const users = [
      {
        email: 'admin@acme.test',
        password: hashPassword('password'),
        role: 'admin' as const,
        tenantId: acmeTenant._id.toString(),
      },
      {
        email: 'user@acme.test',
        password: hashPassword('password'),
        role: 'member' as const,
        tenantId: acmeTenant._id.toString(),
      },
      {
        email: 'admin@globex.test',
        password: hashPassword('password'),
        role: 'admin' as const,
        tenantId: globexTenant._id.toString(),
      },
      {
        email: 'user@globex.test',
        password: hashPassword('password'),
        role: 'member' as const,
        tenantId: globexTenant._id.toString(),
      },
    ];

    for (const userData of users) {
      await User.findOneAndUpdate(
        { email: userData.email },
        userData,
        { upsert: true, new: true }
      );
    }

    console.log('Database initialized successfully with test data');
    console.log('Test accounts created:');
    console.log('- admin@acme.test (Admin, Acme)');
    console.log('- user@acme.test (Member, Acme)');
    console.log('- admin@globex.test (Admin, Globex)');
    console.log('- user@globex.test (Member, Globex)');
    console.log('All passwords: password');

  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

initializeDatabase();
