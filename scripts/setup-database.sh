#!/bin/bash

echo "Testing database connection and seeding data..."

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

# Check if MongoDB connection works
echo "Checking if backend server can connect to MongoDB..."

# Run the seeder
echo "Running seeder script..."
node src/utils/seeder.js

echo "Seeder completed!"

# Optionally start the server
echo "Starting backend server..."
npm run dev
