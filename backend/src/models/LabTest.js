const mongoose = require('mongoose');

const LabTestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  testType: {
    type: String,
    required: true,
    enum: [
      'Complete Blood Count (CBC)',
      'Comprehensive Metabolic Panel',
      'Lipid Panel',
      'Thyroid Function Tests',
      'Liver Function Tests',
      'Kidney Function Tests',
      'Blood Glucose',
      'HbA1c',
      'ESR',
      'CRP',
      'Urine Analysis',
      'Stool Analysis',
      'X-Ray Chest',
      'ECG',
      'Echocardiogram',
      'Ultrasound Abdomen',
      'CT Scan',
      'MRI',
      'Blood Culture',
      'Urine Culture',
      'Other'
    ]
  },
  testCode: {
    type: String,
    required: false,
    unique: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  sampleType: {
    type: String,
    enum: ['blood', 'urine', 'stool', 'sputum', 'tissue', 'swab', 'other'],
    required: true
  },
  sampleCollected: {
    type: Boolean,
    default: false
  },
  sampleCollectedAt: {
    type: Date,
    default: null
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  normalRange: {
    type: String,
    default: null
  },
  interpretation: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  externalDoctorName: {
    type: String,
    default: null
  },
  externalInstitute: {
    type: String,
    default: null
  },
  reportGenerated: {
    type: Boolean,
    default: false
  },
  reportPath: {
    type: String,
    default: null
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
LabTestSchema.index({ patient: 1, status: 1 });
LabTestSchema.index({ testCode: 1 });
LabTestSchema.index({ orderedBy: 1, createdAt: -1 });
LabTestSchema.index({ processedBy: 1, status: 1 });
LabTestSchema.index({ createdAt: -1 });
LabTestSchema.index({ dueDate: 1, status: 1 });

// Generate unique test code before saving
LabTestSchema.pre('save', async function(next) {
  if (this.isNew && !this.testCode) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.testCode = `LAB${date}${randomNum}`;
  }
  next();
});

// Virtual for test age in days
LabTestSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
LabTestSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed' && this.status !== 'cancelled';
});

module.exports = mongoose.model('LabTest', LabTestSchema);
