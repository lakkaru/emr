const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr');
    console.log('Connected to MongoDB');
    
    const Prescription = require('./src/models/Prescription');
    
    console.log('Creating prescription...');
    const prescription = new Prescription({
      patient: new mongoose.Types.ObjectId(),
      doctor: new mongoose.Types.ObjectId(),
      medication: 'Test Med',
      dosage: '100mg',
      frequency: 'Once daily',
      duration: '5 days'
    });
    
    console.log('Before save - prescriptionNumber:', prescription.prescriptionNumber);
    console.log('Before save - expiryDate:', prescription.expiryDate);
    console.log('Before save - isNew:', prescription.isNew);
    
    await prescription.save();
    
    console.log('After save - prescriptionNumber:', prescription.prescriptionNumber);
    console.log('After save - expiryDate:', prescription.expiryDate);
    console.log('Prescription created successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    console.log('Disconnecting...');
    await mongoose.disconnect();
    console.log('Done.');
  }
}

test().catch(console.error);
