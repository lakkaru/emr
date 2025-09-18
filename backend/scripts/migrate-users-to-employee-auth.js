#!/usr/bin/env node
/**
 * Migration script to convert users from email-based authentication to employee-based authentication
 * This script converts existing users to use employeeNumber and username instead of email
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Define the old and new schemas
const OldUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['system_admin', 'medical_officer', 'nursing_officer', 'front_desk', 'lab_officer', 'pharmacy_officer'], default: 'front_desk' },
  passwordHash: { type: String, required: true },
  lastLoginAt: { type: Date }
}, { timestamps: true });

const NewUserSchema = new mongoose.Schema({
  employeeNumber: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['system_admin', 'medical_officer', 'nursing_officer', 'front_desk', 'lab_officer', 'pharmacy_officer'], default: 'front_desk' },
  passwordHash: { type: String, required: true },
  lastLoginAt: { type: Date }
}, { timestamps: true });

async function migrateUsers() {
  try {
    console.log('🔄 Starting user migration from email-based to employee-based authentication...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emr', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get reference to the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find all existing users
    const existingUsers = await usersCollection.find({}).toArray();
    console.log(`📊 Found ${existingUsers.length} existing users to migrate`);
    
    if (existingUsers.length === 0) {
      console.log('ℹ️ No users found to migrate');
      return;
    }

    const migrations = [];
    const roleMapping = {
      'system_admin': 'SYS',
      'medical_officer': 'MED',
      'nursing_officer': 'NUR',
      'front_desk': 'FRD',
      'lab_officer': 'LAB',
      'pharmacy_officer': 'PHR'
    };

    // Generate employee numbers and usernames for each user
    for (let i = 0; i < existingUsers.length; i++) {
      const user = existingUsers[i];
      
      // Generate employee number: Role prefix + sequential number
      const rolePrefix = roleMapping[user.role] || 'EMP';
      const employeeNumber = `${rolePrefix}${String(i + 1).padStart(3, '0')}`;
      
      // Generate username from name (remove spaces, lowercase, add number if duplicate)
      let baseUsername = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (baseUsername.length < 3) baseUsername = `user${i + 1}`;
      if (baseUsername.length > 15) baseUsername = baseUsername.substring(0, 15);
      
      // Ensure username uniqueness
      let username = baseUsername;
      let counter = 1;
      const existingUsernames = migrations.map(m => m.username);
      while (existingUsernames.includes(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      migrations.push({
        _id: user._id,
        employeeNumber,
        username,
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: new Date(),
        // Keep old email for reference during transition
        _migrated_from_email: user.email
      });

      console.log(`👤 ${user.name} (${user.email}) → Employee: ${employeeNumber}, Username: ${username}`);
    }

    console.log('\n🔄 Starting database migration...');
    
    // Backup existing users collection
    console.log('💾 Creating backup of existing users...');
    await usersCollection.aggregate([
      { $match: {} },
      { $out: 'users_backup_email_auth' }
    ]).toArray();
    console.log('✅ Backup created as "users_backup_email_auth"');

    // Update each user document
    for (const migration of migrations) {
      const { _id, _migrated_from_email, ...updateData } = migration;
      
      await usersCollection.updateOne(
        { _id: _id },
        { 
          $set: updateData,
          $unset: { email: "" }  // Remove email field
        }
      );
    }

    console.log('✅ User documents updated successfully');

    // Update indexes
    console.log('🔄 Updating database indexes...');
    try {
      // Drop old email index
      await usersCollection.dropIndex('email_1');
      console.log('✅ Dropped old email index');
    } catch (e) {
      console.log('ℹ️ Email index may not exist, continuing...');
    }

    // Create new indexes
    await usersCollection.createIndex({ employeeNumber: 1 }, { unique: true });
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    console.log('✅ Created new employeeNumber and username indexes');

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log(`   • ${existingUsers.length} users migrated from email to employee authentication`);
    console.log(`   • Backup created: "users_backup_email_auth" collection`);
    console.log(`   • New fields: employeeNumber, username`);
    console.log(`   • Removed fields: email`);
    console.log(`   • Updated indexes for new authentication method\n`);

    console.log('📋 Generated Employee Numbers and Usernames:');
    migrations.forEach(user => {
      console.log(`   • ${user.name}: ${user.employeeNumber} / ${user.username}`);
    });

    console.log('\n⚠️  Important: Update your frontend applications to use username instead of email for login');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateUsers()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateUsers;
