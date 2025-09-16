const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  genericName: String,
  brandNames: [String],
  category: { 
    type: String, 
    enum: ['antibiotic', 'pain-reliever', 'blood-pressure', 'diabetes', 'cholesterol', 'antidepressant', 'antihistamine', 'other'], 
    required: true 
  },
  commonDosages: [String],
  commonFrequencies: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for faster searches
MedicationSchema.index({ name: 1, category: 1 });
MedicationSchema.index({ genericName: 1 });

module.exports = mongoose.model('Medication', MedicationSchema);
