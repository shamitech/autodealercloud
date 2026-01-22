import { Database } from './src/database/db';
import { AdminAuthService } from './src/auth/admin-auth-service';

async function seedAdminUser() {
  const db = new Database(
    process.env.DATABASE_URL ||
      'postgresql://user:password@localhost:5434/autodealercloud_admin'
  );

  const authService = new AdminAuthService();
  const password = 'Children$6';
  const hashedPassword = await authService.hashPassword(password);

  try {
    const connection = await db.getConnection();
    
    // Delete existing user if any
    await connection.query(
      'DELETE FROM admin_users WHERE email = $1',
      ['jaredshami@autodealercloud.com']
    );

    // Insert new user with properly hashed password
    await connection.query(
      'INSERT INTO admin_users (email, password_hash, first_name, last_name, role, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        'jaredshami@autodealercloud.com',
        hashedPassword,
        'Jared',
        'Shami',
        'super_admin',
        'active'
      ]
    );

    console.log('✓ Admin user seeded successfully');
    console.log(`  Email: jaredshami@autodealercloud.com`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: super_admin`);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdminUser();
