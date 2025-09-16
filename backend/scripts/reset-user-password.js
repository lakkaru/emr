#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/utils/db');
const User = require('../src/models/User');

async function main() {
  const email = process.argv[2];
  const newPw = process.argv[3];
  if (!email || !newPw) {
    console.error('Usage: node scripts/reset-user-password.js <email> <newPassword>');
    process.exit(1);
  }
  await connectDB(process.env.MONGODB_URI);
  const user = await User.findOne({ email });
  if (!user) {
    console.error('User not found:', email);
    process.exit(2);
  }
  user.passwordHash = await bcrypt.hash(newPw, 12);
  await user.save();
  console.log('Password updated for', email);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
