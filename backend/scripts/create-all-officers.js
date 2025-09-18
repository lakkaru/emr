#!/usr/bin/env node
/**
 * Script to create all officer types with 8-character passwords
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAllOfficers() {
  try {
    console.log('🔄 Creating all officer types...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr');
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = require('../src/models/User');

    // Officer configurations
    const officers = [
      {
        employeeNumber: 'LAB001',
        username: 'la01',
        name: 'Laboratory Officer',
        role: 'lab_officer',
        password: 'La123456'
      },
      {
        employeeNumber: 'NUR001',
        username: 'nu01',
        name: 'Nursing Officer',
        role: 'nursing_officer',
        password: 'Nu123456'
      },
      {
        employeeNumber: 'PHA001',
        username: 'ph01',
        name: 'Pharmacy Officer',
        role: 'pharmacy_officer',
        password: 'Ph123456'
      }
    ];

    console.log('🗑️ Removing existing officers...');
    await User.deleteMany({ 
      role: { $in: ['lab_officer', 'nursing_officer', 'pharmacy_officer'] } 
    });

    console.log('👥 Creating officers...');
    for (const officerData of officers) {
      const passwordHash = await bcrypt.hash(officerData.password, 12);
      
      const officer = await User.create({
        employeeNumber: officerData.employeeNumber,
        username: officerData.username,
        name: officerData.name,
        role: officerData.role,
        passwordHash
      });

      console.log(`✅ Created ${officerData.role}:`);
      console.log(`   Employee Number: ${officer.employeeNumber}`);
      console.log(`   Username: ${officer.username}`);
      console.log(`   Password: ${officerData.password}`);
      console.log(`   Role: ${officer.role}`);
      console.log('');
    }
    
    console.log('🎉 All officers created successfully!');
    console.log('\n📋 Summary of all officer credentials:');
    for (const officer of officers) {
      console.log(`   ${officer.role}: ${officer.username} / ${officer.password}`);
    }
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️ Some officers already exist');
    } else {
      console.error('❌ Error creating officers:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
createAllOfficers();
