const mongoose = require('mongoose');
const Patient = require('../models/Patient');
require('dotenv').config();

async function debugPatients() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr');
    console.log('Connected to MongoDB');

    const patients = await Patient.find({}).limit(5);
    console.log(`Found ${patients.length} patients:`);
    
    patients.forEach((patient, index) => {
      console.log(`\n--- Patient ${index + 1} ---`);
      console.log(`Name: ${patient.fullName}`);
      console.log(`Address: "${patient.address}"`);
      console.log(`Phones:`, patient.phones);
      console.log(`Old phone field:`, patient.phone);
    });

    process.exit(0);
  } catch (error) {
    console.error('Debug failed:', error);
    process.exit(1);
  }
}

debugPatients();
