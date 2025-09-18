#!/usr/bin/env node
/**
 * Script to create test lab orders for testing the lab barcode scanning feature
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function createTestLabOrders() {
  try {
    console.log('🔄 Creating test lab orders...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr');
    console.log('✅ Connected to MongoDB');

    // Import models
    const User = require('../src/models/User');
    const Patient = require('../src/models/Patient');
    const LabTest = require('../src/models/LabTest');

    // Find medical officer and patients
    const medicalOfficer = await User.findOne({ role: 'medical_officer' });
    if (!medicalOfficer) {
      console.log('❌ No medical officer found. Please create one first.');
      process.exit(1);
    }

    const patients = await Patient.find().limit(3);
    if (patients.length === 0) {
      console.log('❌ No patients found. Please create some patients first.');
      process.exit(1);
    }

    console.log(`📋 Found medical officer: ${medicalOfficer.name}`);
    console.log(`👥 Found ${patients.length} patients`);

    // Create various lab tests
    const labTests = [
      {
        patient: patients[0]._id,
        orderedBy: medicalOfficer._id,
        testType: 'Complete Blood Count',
        priority: 'routine',
        sampleType: 'blood',
        notes: 'Routine checkup - patient complains of fatigue',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        patient: patients[0]._id,
        orderedBy: medicalOfficer._id,
        testType: 'Blood Sugar',
        priority: 'urgent',
        sampleType: 'blood',
        notes: 'Diabetes screening - family history',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      },
      {
        patient: patients.length > 1 ? patients[1]._id : patients[0]._id,
        orderedBy: medicalOfficer._id,
        testType: 'Urine Analysis',
        priority: 'routine',
        sampleType: 'urine',
        notes: 'UTI symptoms - burning sensation',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        patient: patients.length > 2 ? patients[2]._id : patients[0]._id,
        orderedBy: medicalOfficer._id,
        testType: 'X-Ray',
        priority: 'stat',
        sampleType: 'other',
        notes: 'Chest X-ray - persistent cough for 3 weeks',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
      },
      {
        patient: patients[0]._id,
        orderedBy: medicalOfficer._id,
        testType: 'Liver Function Test',
        priority: 'routine',
        sampleType: 'blood',
        notes: 'Pre-medication screening',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    ];

    // Clear existing lab tests
    await LabTest.deleteMany({});
    console.log('🗑️ Cleared existing lab tests');

    // Create new lab tests
    const createdTests = await LabTest.create(labTests);
    console.log(`✅ Created ${createdTests.length} test lab orders:`);

    for (const test of createdTests) {
      await test.populate('patient', 'fullName');
      console.log(`   📝 ${test.testCode}: ${test.testType} for ${test.patient.fullName} (${test.priority})`);
    }

    console.log('\n🎉 Test lab orders created successfully!');
    console.log('\nYou can now:');
    console.log('1. Login as lab officer and use the barcode scanner');
    console.log('2. Scan patient barcodes to view their lab tests');
    console.log('3. Process tests by changing status and entering results');
    
  } catch (error) {
    console.error('❌ Error creating test lab orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
createTestLabOrders();
