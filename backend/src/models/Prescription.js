const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Diagnosis',
    default: null
  },
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      default: ''
    }
  }],
  generalInstructions: {
    type: String,
    default: ''
  },
  attachments: [{
    filename: String,
    mimetype: String,
    data: Buffer,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  prescriptionNumber: {
    type: String,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  dispensedAt: {
    type: Date,
    default: null
  },
  expiryDate: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
PrescriptionSchema.index({ patient: 1, createdAt: -1 });
PrescriptionSchema.index({ doctor: 1, createdAt: -1 });
PrescriptionSchema.index({ status: 1 });
PrescriptionSchema.index({ expiryDate: 1 });

// Generate unique prescription number and set expiry date before saving
PrescriptionSchema.pre('save', async function(next) {
  try {
    // Generate prescription number if new document and no number exists
    if (this.isNew && !this.prescriptionNumber) {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      this.prescriptionNumber = `RX${date}${randomNum}`;
    }
    
    // Set expiry date if new document and no expiry date exists
    if (this.isNew && !this.expiryDate) {
      // Default to 30 days from now, or parse duration from medications
      let maxDays = 30; // default
      
      if (this.medications && this.medications.length > 0) {
        // Find the longest duration among all medications
        for (const medication of this.medications) {
          if (medication.duration) {
            const durationMatch = medication.duration.match(/(\d+)\s*(day|week|month)/i);
            
            if (durationMatch) {
              const num = parseInt(durationMatch[1]);
              const unit = durationMatch[2].toLowerCase();
              
              let days = 30; // default for this medication
              if (unit.startsWith('day')) days = num;
              else if (unit.startsWith('week')) days = num * 7;
              else if (unit.startsWith('month')) days = num * 30;
              
              maxDays = Math.max(maxDays, days);
            }
          }
        }
      }
      
      this.expiryDate = new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000);
    }
    
    // Validate required fields after auto-generation
    if (!this.prescriptionNumber) {
      return next(new Error('Prescription number is required'));
    }
    if (!this.expiryDate) {
      return next(new Error('Expiry date is required'));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
