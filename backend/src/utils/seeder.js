const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Allergy = require('../models/Allergy');
const Medication = require('../models/Medication');
require('dotenv').config();

// Common allergies with reactions
const allergiesData = [
  {
    name: 'Peanuts',
    category: 'food',
    commonReactions: [
      { name: 'Hives', severity: 'mild' },
      { name: 'Swelling', severity: 'moderate' },
      { name: 'Anaphylaxis', severity: 'severe' }
    ]
  },
  {
    name: 'Shellfish',
    category: 'food',
    commonReactions: [
      { name: 'Itching', severity: 'mild' },
      { name: 'Nausea', severity: 'moderate' },
      { name: 'Breathing difficulty', severity: 'severe' }
    ]
  },
  {
    name: 'Penicillin',
    category: 'medication',
    commonReactions: [
      { name: 'Rash', severity: 'mild' },
      { name: 'Fever', severity: 'moderate' },
      { name: 'Anaphylaxis', severity: 'severe' }
    ]
  },
  {
    name: 'Aspirin',
    category: 'medication',
    commonReactions: [
      { name: 'Stomach upset', severity: 'mild' },
      { name: 'Bleeding', severity: 'moderate' },
      { name: 'Bronchospasm', severity: 'severe' }
    ]
  },
  {
    name: 'Pollen',
    category: 'environmental',
    commonReactions: [
      { name: 'Sneezing', severity: 'mild' },
      { name: 'Runny nose', severity: 'mild' },
      { name: 'Watery eyes', severity: 'moderate' }
    ]
  },
  {
    name: 'Dust mites',
    category: 'environmental',
    commonReactions: [
      { name: 'Sneezing', severity: 'mild' },
      { name: 'Coughing', severity: 'moderate' },
      { name: 'Asthma attack', severity: 'severe' }
    ]
  },
  {
    name: 'Latex',
    category: 'other',
    commonReactions: [
      { name: 'Skin irritation', severity: 'mild' },
      { name: 'Hives', severity: 'moderate' },
      { name: 'Anaphylaxis', severity: 'severe' }
    ]
  }
];

// Common medications
const medicationsData = [
  {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    brandNames: ['Amoxil', 'Trimox'],
    category: 'antibiotic',
    commonDosages: ['250mg', '500mg', '875mg'],
    commonFrequencies: ['Every 8 hours', 'Every 12 hours', 'Three times daily']
  },
  {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brandNames: ['Advil', 'Motrin'],
    category: 'pain-reliever',
    commonDosages: ['200mg', '400mg', '600mg', '800mg'],
    commonFrequencies: ['Every 6 hours', 'Every 8 hours', 'As needed']
  },
  {
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    brandNames: ['Prinivil', 'Zestril'],
    category: 'blood-pressure',
    commonDosages: ['5mg', '10mg', '20mg', '40mg'],
    commonFrequencies: ['Once daily', 'Twice daily']
  },
  {
    name: 'Metformin',
    genericName: 'Metformin',
    brandNames: ['Glucophage', 'Fortamet'],
    category: 'diabetes',
    commonDosages: ['500mg', '850mg', '1000mg'],
    commonFrequencies: ['Once daily', 'Twice daily', 'Three times daily']
  },
  {
    name: 'Atorvastatin',
    genericName: 'Atorvastatin',
    brandNames: ['Lipitor'],
    category: 'cholesterol',
    commonDosages: ['10mg', '20mg', '40mg', '80mg'],
    commonFrequencies: ['Once daily in evening']
  },
  {
    name: 'Sertraline',
    genericName: 'Sertraline',
    brandNames: ['Zoloft'],
    category: 'antidepressant',
    commonDosages: ['25mg', '50mg', '100mg', '150mg', '200mg'],
    commonFrequencies: ['Once daily']
  },
  {
    name: 'Cetirizine',
    genericName: 'Cetirizine',
    brandNames: ['Zyrtec'],
    category: 'antihistamine',
    commonDosages: ['5mg', '10mg'],
    commonFrequencies: ['Once daily', 'As needed']
  }
];

// Dummy patients data
const patientsData = [
  {
    fullName: 'John Michael Smith',
    nickname: 'John',
    dob: new Date('1985-03-15'),
    gender: 'Male',
    address: '123 Main Street, Springfield, IL 62701',
    phones: [
      { type: 'mobile', number: '555-123-4567' },
      { type: 'home', number: '555-987-6543' }
    ],
    email: 'john.smith@email.com',
    insurance: {
      provider: 'Blue Cross Blue Shield',
      memberId: 'BC123456789',
      groupNumber: 'GRP001',
      coverageNotes: 'PPO Plan - $20 copay'
    },
    referral: {
      source: 'Dr. Johnson Family Practice',
      contact: '555-234-5678'
    },
    allergies: [
      { substance: 'Penicillin', reaction: 'Rash', severity: 'mild' },
      { substance: 'Peanuts', reaction: 'Hives', severity: 'moderate' }
    ],
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
    ],
    pastMedicalHistory: 'Hypertension diagnosed 2020, Type 2 Diabetes diagnosed 2022',
    problemList: [
      { code: 'I10', description: 'Essential hypertension', status: 'active' },
      { code: 'E11.9', description: 'Type 2 diabetes mellitus', status: 'active' }
    ],
    immunizations: [
      { name: 'COVID-19', date: new Date('2023-09-15') },
      { name: 'Influenza', date: new Date('2023-10-01') }
    ],
    vitalsAtCheckIn: {
      temperatureC: 36.8,
      bloodPressure: '130/85',
      respiratoryRate: 16,
      pulse: 78
    }
  },
  {
    fullName: 'Sarah Elizabeth Johnson',
    nickname: 'Sarah',
    dob: new Date('1992-07-22'),
    gender: 'Female',
    address: '456 Oak Avenue, Chicago, IL 60601',
    phones: [
      { type: 'mobile', number: '555-234-5678' },
      { type: 'work', number: '555-345-6789' }
    ],
    email: 'sarah.johnson@email.com',
    insurance: {
      provider: 'Aetna',
      memberId: 'AET789012345',
      groupNumber: 'GRP002',
      coverageNotes: 'HMO Plan - $15 copay'
    },
    referral: {
      source: 'Self-referral',
      contact: ''
    },
    allergies: [
      { substance: 'Shellfish', reaction: 'Swelling', severity: 'severe' }
    ],
    medications: [
      { name: 'Sertraline', dosage: '50mg', frequency: 'Once daily' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'As needed' }
    ],
    pastMedicalHistory: 'Depression diagnosed 2021, Seasonal allergies',
    problemList: [
      { code: 'F32.9', description: 'Major depressive disorder', status: 'active' },
      { code: 'J30.1', description: 'Allergic rhinitis', status: 'active' }
    ],
    immunizations: [
      { name: 'COVID-19', date: new Date('2023-08-20') },
      { name: 'Tdap', date: new Date('2022-03-15') }
    ],
    vitalsAtCheckIn: {
      temperatureC: 36.5,
      bloodPressure: '118/72',
      respiratoryRate: 14,
      pulse: 68
    }
  },
  {
    fullName: 'Robert William Davis',
    nickname: 'Bob',
    dob: new Date('1978-11-08'),
    gender: 'Male',
    address: '789 Pine Street, Rockford, IL 61101',
    phones: [
      { type: 'mobile', number: '555-345-6789' }
    ],
    email: 'bob.davis@email.com',
    insurance: {
      provider: 'United Healthcare',
      memberId: 'UH345678901',
      groupNumber: 'GRP003',
      coverageNotes: 'High deductible plan'
    },
    referral: {
      source: 'Emergency Department',
      contact: '555-456-7890'
    },
    allergies: [
      { substance: 'Aspirin', reaction: 'Stomach upset', severity: 'mild' }
    ],
    medications: [
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily in evening' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed' }
    ],
    pastMedicalHistory: 'High cholesterol diagnosed 2019, Lower back pain',
    problemList: [
      { code: 'E78.5', description: 'Hyperlipidemia', status: 'active' },
      { code: 'M54.5', description: 'Low back pain', status: 'active' }
    ],
    immunizations: [
      { name: 'COVID-19', date: new Date('2023-07-10') }
    ],
    vitalsAtCheckIn: {
      temperatureC: 37.1,
      bloodPressure: '142/88',
      respiratoryRate: 18,
      pulse: 82
    }
  },
  {
    fullName: 'Maria Elena Rodriguez',
    nickname: 'Maria',
    dob: new Date('1995-01-30'),
    gender: 'Female',
    address: '321 Elm Street, Peoria, IL 61602',
    phones: [
      { type: 'mobile', number: '555-456-7890' },
      { type: 'mobile', number: '555-567-8901' },
      { type: 'home', number: '555-678-9012' }
    ],
    email: 'maria.rodriguez@email.com',
    insurance: {
      provider: 'Medicaid',
      memberId: 'MCD456789012',
      groupNumber: 'MEDICAID',
      coverageNotes: 'State coverage - no copay'
    },
    referral: {
      source: 'Community Health Center',
      contact: '555-567-8901'
    },
    allergies: [],
    medications: [],
    pastMedicalHistory: 'No significant medical history',
    problemList: [],
    immunizations: [
      { name: 'COVID-19', date: new Date('2023-09-05') },
      { name: 'Influenza', date: new Date('2023-09-20') },
      { name: 'HPV', date: new Date('2021-06-15') }
    ],
    vitalsAtCheckIn: {
      temperatureC: 36.7,
      bloodPressure: '115/70',
      respiratoryRate: 15,
      pulse: 72
    }
  },
  {
    fullName: 'James Alexander Wilson',
    nickname: 'Jim',
    dob: new Date('1965-12-03'),
    gender: 'Male',
    address: '654 Maple Drive, Decatur, IL 62521',
    phones: [
      { type: 'home', number: '555-678-9012' },
      { type: 'mobile', number: '555-789-0123' }
    ],
    email: 'jim.wilson@email.com',
    insurance: {
      provider: 'Medicare',
      memberId: 'MED567890123',
      groupNumber: 'MEDICARE',
      coverageNotes: 'Medicare Part B - 80% coverage'
    },
    referral: {
      source: 'Dr. Anderson Cardiology',
      contact: '555-678-9012'
    },
    allergies: [
      { substance: 'Dust mites', reaction: 'Coughing', severity: 'moderate' },
      { substance: 'Latex', reaction: 'Skin irritation', severity: 'mild' }
    ],
    medications: [
      { name: 'Lisinopril', dosage: '20mg', frequency: 'Once daily' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily in evening' },
      { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily' }
    ],
    pastMedicalHistory: 'Coronary artery disease s/p stent 2018, Type 2 Diabetes, Hypertension',
    problemList: [
      { code: 'I25.10', description: 'Coronary artery disease', status: 'active' },
      { code: 'E11.9', description: 'Type 2 diabetes mellitus', status: 'active' },
      { code: 'I10', description: 'Essential hypertension', status: 'active' }
    ],
    immunizations: [
      { name: 'COVID-19', date: new Date('2023-08-15') },
      { name: 'Pneumococcal', date: new Date('2022-11-10') },
      { name: 'Shingles', date: new Date('2021-05-20') }
    ],
    vitalsAtCheckIn: {
      temperatureC: 36.9,
      bloodPressure: '135/82',
      respiratoryRate: 16,
      pulse: 75
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Allergy.deleteMany({});
    await Medication.deleteMany({});
    await Patient.deleteMany({});
    console.log('Cleared existing data');

    // Seed allergies
    const allergies = await Allergy.insertMany(allergiesData);
    console.log(`Created ${allergies.length} allergies`);

    // Seed medications
    const medications = await Medication.insertMany(medicationsData);
    console.log(`Created ${medications.length} medications`);

    // Generate dedupeKey for patients and seed
    const patientsWithDedupeKey = patientsData.map(patient => ({
      ...patient,
      dedupeKey: `${patient.fullName.toLowerCase().replace(/\s+/g, '')}_${patient.dob.toISOString().split('T')[0]}_${patient.phones[0].number.replace(/\D/g, '')}`
    }));

    const patients = await Patient.insertMany(patientsWithDedupeKey);
    console.log(`Created ${patients.length} patients`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
