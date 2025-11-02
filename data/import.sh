#!/bin/bash

# Script để import dữ liệu vào MongoDB
# Sử dụng: ./import.sh <database_name> <mongo_uri>

DB_NAME=${1:-mypet}
MONGO_URI=${2:-mongodb://localhost:27017}

echo "Importing data to MongoDB..."
echo "Database: $DB_NAME"
echo "MongoDB URI: $MONGO_URI"

# Import Users
echo "Importing users..."
mongoimport --uri "$MONGO_URI/$DB_NAME" --collection users --file users.json --jsonArray

# Import Clinics
echo "Importing clinics..."
mongoimport --uri "$MONGO_URI/$DB_NAME" --collection clinics --file clinics.json --jsonArray

# Import Doctors
echo "Importing doctors..."
mongoimport --uri "$MONGO_URI/$DB_NAME" --collection doctors --file doctors.json --jsonArray

# Import Appointments
echo "Importing appointments..."
mongoimport --uri "$MONGO_URI/$DB_NAME" --collection appointments --file appointments.json --jsonArray

# Import Doctor Schedules
echo "Importing doctor schedules..."
mongoimport --uri "$MONGO_URI/$DB_NAME" --collection doctorschedules --file doctorschedules.json --jsonArray

echo "Import completed!"

