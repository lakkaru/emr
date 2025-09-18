#!/usr/bin/env node
/**
 * Script to clean up database and remove old indexes for employee-based authentication
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function cleanupDatabase() {
  try {
    console.log('🔄 Cleaning up database for employee-based authentication...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Drop the entire users collection to start fresh
    try {
      await usersCollection.drop();
      console.log('🗑️ Dropped users collection');
    } catch (e) {
      console.log('ℹ️ Users collection may not exist');
    }
    
    // Create new collection with proper schema
    console.log('🔄 Creating new users collection...');
    
    // Create the collection with new indexes
    await usersCollection.createIndex({ employeeNumber: 1 }, { unique: true });
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    console.log('✅ Created new indexes for employeeNumber and username');
    
    // Create test admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const admin = await usersCollection.insertOne({
      employeeNumber: 'SYS001',
      username: 'admin',
      name: 'System Administrator',
      role: 'system_admin',
      passwordHash: adminPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Created test admin user:');
    console.log(`   Employee Number: SYS001`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`   Role: system_admin`);
    
    // Create test front desk user
    const frontDeskPasswordHash = await bcrypt.hash('frontdesk123', 12);
    const frontDesk = await usersCollection.insertOne({
      employeeNumber: 'FRD001',
      username: 'frontdesk01',
      name: 'Front Desk Officer',
      role: 'front_desk',
      passwordHash: frontDeskPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Created test front desk user:');
    console.log(`   Employee Number: FRD001`);
    console.log(`   Username: frontdesk01`);
    console.log(`   Password: frontdesk123`);
    console.log(`   Role: front_desk`);
    
    // Create test medical officer
    const medicalPasswordHash = await bcrypt.hash('medical123', 12);
    const medical = await usersCollection.insertOne({
      employeeNumber: 'MED001',
      username: 'doctor01',
      name: 'Dr. Medical Officer',
      role: 'medical_officer',
      passwordHash: medicalPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Created test medical officer:');
    console.log(`   Employee Number: MED001`);
    console.log(`   Username: doctor01`);
    console.log(`   Password: medical123`);
    console.log(`   Role: medical_officer`);
    
    console.log('\n🎉 Database cleanup and test user creation completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Front Desk: frontdesk01 / frontdesk123');
    console.log('   Medical Officer: doctor01 / medical123');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
cleanupDatabase()
  .then(() => {
    console.log('✅ Database cleanup script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database cleanup script failed:', error);
    process.exit(1);
  });
