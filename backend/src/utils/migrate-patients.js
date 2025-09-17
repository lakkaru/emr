const mongoose = require('mongoose');
const Patient = require('../models/Patient');
require('dotenv').config();

async function migratePatients() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr');
    console.log('Connected to MongoDB');

    // Find patients with old phone structure
    const patientsWithOldPhone = await Patient.find({ phone: { $exists: true, $ne: null } });
    console.log(`Found ${patientsWithOldPhone.length} patients with old phone structure`);

    for (let patient of patientsWithOldPhone) {
      // Convert old phone to new phones array
      if (patient.phone && (!patient.phones || patient.phones.length === 0)) {
        patient.phones = [{ type: 'mobile', number: patient.phone }];
        
        // Remove old phone field
        patient.phone = undefined;
        
        await patient.save();
        console.log(`Migrated patient: ${patient.fullName}`);
      }
    }

    // Find patients without addresses and add sample addresses
    const patientsWithoutAddress = await Patient.find({ 
      $or: [
        { address: { $exists: false } },
        { address: null },
        { address: '' }
      ]
    });
    
    console.log(`Found ${patientsWithoutAddress.length} patients without addresses`);

    const sampleAddresses = [
      '123 Main Street, Springfield, IL 62701',
      '456 Oak Avenue, Chicago, IL 60601', 
      '789 Pine Street, Rockford, IL 61101',
      '321 Elm Street, Peoria, IL 61602',
      '654 Maple Drive, Decatur, IL 62521'
    ];

    for (let i = 0; i < patientsWithoutAddress.length; i++) {
      const patient = patientsWithoutAddress[i];
      patient.address = sampleAddresses[i % sampleAddresses.length];
      await patient.save();
      console.log(`Added address to patient: ${patient.fullName}`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migratePatients();
}

module.exports = { migratePatients };
