const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Announcement = require('../src/models/Announcement');
const User = require('../src/models/User');

const sampleAnnouncements = [
  {
    title: 'New Patient Privacy Policy Updates',
    content: 'We have updated our patient privacy policies in accordance with the latest healthcare regulations. All staff members are required to review the updated policies and acknowledge their understanding. The new policies include enhanced data protection measures and updated consent procedures. Please ensure you are familiar with these changes before your next shift.',
    type: 'policy',
    priority: 'high',
    targetRoles: ['medical_officer', 'nurse', 'receptionist'],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  {
    title: 'System Maintenance Scheduled',
    content: 'The EMR system will undergo scheduled maintenance on Saturday, September 23rd, 2025 from 2:00 AM to 6:00 AM. During this time, the system will be temporarily unavailable. Please ensure all patient records are updated before the maintenance window. Emergency procedures will remain in effect using manual documentation.',
    type: 'system',
    priority: 'critical',
    targetRoles: ['all'],
    expiryDate: new Date('2025-09-24T00:00:00.000Z')
  },
  {
    title: 'Mandatory CPR Training Session',
    content: 'All medical staff are required to attend the CPR recertification training scheduled for next week. Sessions are available on Monday, Wednesday, and Friday from 3:00 PM to 5:00 PM in the training room. Please sign up for your preferred session at the reception desk. This training is mandatory for maintaining your certification.',
    type: 'training',
    priority: 'high',
    targetRoles: ['medical_officer', 'nurse'],
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
  },
  {
    title: 'New Hand Hygiene Protocol',
    content: 'Following WHO guidelines, we have implemented an enhanced hand hygiene protocol. New sanitization stations have been installed throughout the facility. All staff members must follow the 5-moment hand hygiene approach. Training materials are available in the staff common area.',
    type: 'general',
    priority: 'medium',
    targetRoles: ['all']
  },
  {
    title: 'Equipment Update: New Digital Stethoscopes',
    content: 'We have received the new digital stethoscopes for all medical officers. These devices offer enhanced sound quality and recording capabilities. Training sessions for the new equipment will be conducted by our biomedical team. Please schedule your training session with the equipment department.',
    type: 'general',
    priority: 'medium',
    targetRoles: ['medical_officer']
  },
  {
    title: 'Pharmacy Stock Alert',
    content: 'Several essential medications are running low in our pharmacy inventory. Please check current stock levels before prescribing the following medications: Amoxicillin 500mg, Metformin 850mg, and Atorvastatin 20mg. Alternative medications are available. Contact pharmacy for current availability.',
    type: 'urgent',
    priority: 'high',
    targetRoles: ['medical_officer', 'pharmacist'],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  {
    title: 'Annual Quality Assurance Review',
    content: 'Our annual quality assurance review will begin next month. All departments will be evaluated for compliance with healthcare standards. Please ensure that all documentation is up to date and protocols are being followed. The review team will be visiting all departments over a two-week period.',
    type: 'general',
    priority: 'low',
    targetRoles: ['all']
  }
];

async function seedAnnouncements() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find admin user to set as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('Admin user not found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('Found admin user:', adminUser.name);

    // Clear existing announcements
    await Announcement.deleteMany({});
    console.log('Cleared existing announcements');

    // Add createdBy field to sample announcements
    const announcementsWithCreator = sampleAnnouncements.map(announcement => ({
      ...announcement,
      createdBy: adminUser._id
    }));

    // Insert sample announcements
    const insertedAnnouncements = await Announcement.insertMany(announcementsWithCreator);
    console.log(`Inserted ${insertedAnnouncements.length} sample announcements`);

    // Display summary
    console.log('\nSample announcements created:');
    insertedAnnouncements.forEach((announcement, index) => {
      console.log(`${index + 1}. ${announcement.title} (${announcement.priority} priority, ${announcement.type})`);
    });

    console.log('\nAnnouncements seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding announcements:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedAnnouncements();
}

module.exports = { seedAnnouncements, sampleAnnouncements };
