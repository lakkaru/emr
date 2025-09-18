#!/usr/bin/env node
/**
 * Quick script to create a test admin user with the new employee-based authentication
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  employeeNumber: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['system_admin', 'medical_officer', 'nursing_officer', 'front_desk', 'lab_officer', 'pharmacy_officer'], default: 'front_desk' },
  passwordHash: { type: String, required: true },
  lastLoginAt: { type: Date }
}, { timestamps: true });

async function createTestAdmin() {
  try {
    console.log('🔄 Creating test admin user...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', UserSchema);
    
    // Remove all existing users first (for testing)
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');
    
    // Create test admin
    const passwordHash = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      employeeNumber: 'SYS001',
      username: 'admin',
      name: 'System Administrator',
      role: 'system_admin',
      passwordHash
    });
    
    console.log('✅ Created test admin user:');
    console.log(`   Employee Number: ${admin.employeeNumber}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${admin.role}`);
    
    // Create test front desk user
    const frontDeskPasswordHash = await bcrypt.hash('frontdesk123', 12);
    const frontDesk = await User.create({
      employeeNumber: 'FRD001',
      username: 'frontdesk01',
      name: 'Front Desk Officer',
      role: 'front_desk',
      passwordHash: frontDeskPasswordHash
    });
    
    console.log('✅ Created test front desk user:');
    console.log(`   Employee Number: ${frontDesk.employeeNumber}`);
    console.log(`   Username: ${frontDesk.username}`);
    console.log(`   Password: frontdesk123`);
    console.log(`   Role: ${frontDesk.role}`);
    
    console.log('\n🎉 Test users created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create test users:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createTestAdmin()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
