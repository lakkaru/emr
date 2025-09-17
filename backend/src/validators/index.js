const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('admin', 'doctor', 'nurse', 'clerk').default('clerk')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const patientSchema = Joi.object({
  fullName: Joi.string().min(1).required(),
  nickname: Joi.string().allow('', null),
  nic: Joi.string().pattern(/^(?:\d{12}|\d{9}[vVxX])$/).required().messages({
    'string.pattern.base': 'NIC must be either 12 digits (new format) or 9 digits followed by V/X (old format)'
  }),
  dob: Joi.date().iso().required(),
  gender: Joi.string().allow('', null),
  address: Joi.string().allow('', null),
  phones: Joi.array().items(Joi.object({
    type: Joi.string().valid('mobile', 'home', 'work').default('mobile'),
    number: Joi.string().pattern(/^[0-9+\-()\s]{6,20}$/).allow('', null)
  })).min(1).default([{ type: 'mobile', number: '' }]),
  email: Joi.string().email().allow('', null),
  insurance: Joi.object({
    provider: Joi.string().allow('', null),
    memberId: Joi.string().allow('', null),
    groupNumber: Joi.string().allow('', null),
    coverageNotes: Joi.string().allow('', null)
  }).default({}),
  referral: Joi.object({
    source: Joi.string().allow('', null),
    contact: Joi.string().allow('', null)
  }).default({}),
  allergies: Joi.array().items(Joi.object({
    substance: Joi.string().required(),
    reaction: Joi.string().allow('', null),
    severity: Joi.string().valid('mild', 'moderate', 'severe').allow('', null)
  })).default([]),
  medications: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    dosage: Joi.string().allow('', null),
    frequency: Joi.string().allow('', null)
  })).default([]),
  pastMedicalHistory: Joi.string().allow('', null),
  problemList: Joi.array().items(Joi.object({
    code: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    status: Joi.string().default('unspecified')
  })).default([]),
  immunizations: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    date: Joi.date().iso().allow(null)
  })).default([]),
  vitalsAtCheckIn: Joi.object({
    temperatureC: Joi.number().min(30).max(45).allow(null),
    bloodPressure: Joi.string().allow('', null),
    respiratoryRate: Joi.number().min(5).max(80).allow(null),
    pulse: Joi.number().min(20).max(260).allow(null)
  }).default({})
});

module.exports = { registerSchema, loginSchema, patientSchema };
