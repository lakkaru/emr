#!/usr/bin/env node
/**
 * Script to create a lab officer user for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createLabOfficer() {
  try {
    console.log('🔄 Creating lab officer user...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr');
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = require('../src/models/User');

    // Create lab officer
    const passwordHash = await bcrypt.hash('La123456', 12);
    const labOfficer = await User.create({
      employeeNumber: 'LAB001',
      username: 'la01',
      name: 'Laboratory Officer',
      role: 'lab_officer',
      passwordHash
    });

    console.log('✅ Created lab officer user:');
    console.log(`   Employee Number: ${labOfficer.employeeNumber}`);
    console.log(`   Username: ${labOfficer.username}`);
    console.log(`   Password: La123456`);
    console.log(`   Role: ${labOfficer.role}`);
    
    console.log('\n🎉 Lab officer created successfully!');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️ Lab officer already exists');
    } else {
      console.error('❌ Error creating lab officer:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
createLabOfficer();
