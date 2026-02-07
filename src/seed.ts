import { connect } from 'mongoose';
import { Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-nestjs';

// User Schema interface
interface User {
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

async function seed() {
  try {
    // Connect to MongoDB
    const connection = await connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const userSchema = new Schema({
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['admin', 'user'], default: 'user' },
      refreshToken: { type: String },
    });

    const User = connection.model('User', userSchema, 'users');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('Admin123', 10);
      await User.create({
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
      });
      console.log('Admin user created');
      console.log('Email: admin@example.com');
      console.log('Password: Admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Create demo user
    const userExists = await User.findOne({ email: 'user@example.com' });
    if (!userExists) {
      const userPassword = await bcrypt.hash('User123', 10);
      await User.create({
        email: 'user@example.com',
        password: userPassword,
        role: 'user',
      });
      console.log('Demo user created');
      console.log('Email: user@example.com');
      console.log('Password: User123');
    } else {
      console.log('Demo user already exists');
    }

    console.log('\nDatabase seeded successfully!');
    console.log('Remember to change default passwords in production!\n');

    await connection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();