const mongoose = require('mongoose');

const AllergySchema = new mongoose.Schema({
  substance: String,
  reaction: String,
  severity: { type: String, enum: ['mild', 'moderate', 'severe'] }
}, { _id: false });

const MedicationSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String
}, { _id: false });

const VitalSignsSchema = new mongoose.Schema({
  temperatureC: Number,
  bloodPressure: String,
  respiratoryRate: Number,
  pulse: Number
}, { _id: false, timestamps: true });

const PatientSchema = new mongoose.Schema({
  // I. Demographic and Contact
  fullName: { type: String, required: true, index: true },
  nickname: String,
  nic: { type: String, required: true, unique: true, index: true },
  dob: { type: Date, required: true, index: true },
  gender: String,
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], 
    default: '',
    index: true 
  },
  address: String,
  phones: [{ 
    type: { type: String, enum: ['mobile', 'home', 'work'], default: 'mobile' },
    number: { type: String, required: true }
  }],
  email: { type: String },
  // II. Administrative
  insurance: {
    provider: String,
    memberId: String,
    groupNumber: String,
    coverageNotes: String
  },
  referral: {
    source: String,
    contact: String
  },
  // III. Initial Medical
  allergies: [AllergySchema],
  medications: [MedicationSchema],
  pastMedicalHistory: String,
  problemList: [{ code: String, description: String, status: { type: String, default: 'unspecified' } }],
  immunizations: [{ name: String, date: Date }],
  vitalsAtCheckIn: VitalSignsSchema,

  // Duplicate detection helper hash (name+dob+phone normalized)
  dedupeKey: { type: String, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
