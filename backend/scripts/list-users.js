#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/utils/db');
const User = require('../src/models/User');

async function main() {
  await connectDB(process.env.MONGODB_URI);
  const users = await User.find({}, { email: 1, name: 1, role: 1, lastLoginAt: 1 }).sort({ createdAt: -1 });
  console.log(users.map(u => ({ id: u._id.toString(), email: u.email, name: u.name, role: u.role, lastLoginAt: u.lastLoginAt })));
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
