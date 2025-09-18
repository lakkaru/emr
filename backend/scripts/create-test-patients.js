#!/usr/bin/env node
/**
 * Script to create test patients for testing lab orders
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function createTestPatients() {
  try {
    console.log('🔄 Creating test patients...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr');
    console.log('✅ Connected to MongoDB');

    // Import Patient model
    const Patient = require('../src/models/Patient');

    // Test patients data
    const testPatients = [
      {
        fullName: 'John Doe',
        nic: '123456789V',
        dob: new Date('1980-05-15'),
        gender: 'male',
        address: '123 Main Street, Colombo 10000, Sri Lanka',
        phones: [
          { type: 'mobile', number: '+94771234567' }
        ],
        email: 'john.doe@email.com'
      },
      {
        fullName: 'Maria Silva',
        nic: '987654321V',
        dob: new Date('1992-08-22'),
        gender: 'female',
        address: '456 Garden Road, Kandy 20000, Sri Lanka',
        phones: [
          { type: 'mobile', number: '+94777654321' }
        ],
        email: 'maria.silva@email.com'
      },
      {
        fullName: 'Ahmed Rahman',
        nic: '456789123V',
        dob: new Date('1975-12-10'),
        gender: 'male',
        address: '789 Temple Street, Galle 80000, Sri Lanka',
        phones: [
          { type: 'mobile', number: '+94769876543' }
        ],
        email: 'ahmed.rahman@email.com'
      }
    ];

    // Clear existing patients
    await Patient.deleteMany({});
    console.log('🗑️ Cleared existing patients');

    // Create new patients
    const createdPatients = await Patient.create(testPatients);
    console.log(`✅ Created ${createdPatients.length} test patients:`);

    for (const patient of createdPatients) {
      console.log(`   👤 ${patient.fullName} (ID: ${patient._id}, NIC: ${patient.nic})`);
    }

    console.log('\n🎉 Test patients created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test patients:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
createTestPatients();
