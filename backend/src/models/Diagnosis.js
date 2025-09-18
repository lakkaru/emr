const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  symptoms: {
    type: String,
    default: ''
  },
  treatment: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'critical'],
    default: 'moderate'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'chronic', 'follow_up'],
    default: 'active'
  },
  followUpDate: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
DiagnosisSchema.index({ patient: 1, createdAt: -1 });
DiagnosisSchema.index({ doctor: 1, createdAt: -1 });
DiagnosisSchema.index({ status: 1 });

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
