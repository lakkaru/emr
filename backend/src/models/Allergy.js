const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  severity: { type: String, enum: ['mild', 'moderate', 'severe'], required: true }
}, { _id: false });

const AllergySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['food', 'medication', 'environmental', 'other'], 
    required: true 
  },
  commonReactions: [ReactionSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for faster searches
AllergySchema.index({ name: 1, category: 1 });

module.exports = mongoose.model('Allergy', AllergySchema);
