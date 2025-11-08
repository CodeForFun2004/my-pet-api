// Script Node.js để import dữ liệu vào MongoDB
// Sử dụng: node import.js <database_name> <mongo_uri>

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DB_NAME = process.argv[2] || 'mypet';
const MONGO_URI = process.argv[3] || 'mongodb://localhost:27017';

const files = [
  { file: 'users.json', collection: 'users' },
  { file: 'clinics.json', collection: 'clinics' },
  { file: 'doctors.json', collection: 'doctors' },
  { file: 'appointments.json', collection: 'appointments' },
  { file: 'doctorschedules.json', collection: 'doctorschedules' }
];

async function importData() {
  try {
    console.log(`Connecting to MongoDB: ${MONGO_URI}/${DB_NAME}`);
    await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
    console.log('Connected to MongoDB');

    for (const { file, collection } of files) {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${file}`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Convert MongoDB Extended JSON format to plain objects
      const convertedData = data.map(item => {
        const converted = {};
        for (const [key, value] of Object.entries(item)) {
          if (value && typeof value === 'object' && '$oid' in value) {
            converted[key] = new mongoose.Types.ObjectId(value.$oid);
          } else if (value && typeof value === 'object' && '$date' in value) {
            converted[key] = new Date(value.$date);
          } else if (Array.isArray(value)) {
            converted[key] = value.map(v => {
              if (v && typeof v === 'object' && '$oid' in v) {
                return new mongoose.Types.ObjectId(v.$oid);
              } else if (v && typeof v === 'object' && '$date' in v) {
                return new Date(v.$date);
              }
              return v;
            });
          } else if (value && typeof value === 'object') {
            const nested = {};
            for (const [k, v] of Object.entries(value)) {
              if (v && typeof v === 'object' && '$oid' in v) {
                nested[k] = new mongoose.Types.ObjectId(v.$oid);
              } else if (v && typeof v === 'object' && '$date' in v) {
                nested[k] = new Date(v.$date);
              } else {
                nested[k] = v;
              }
            }
            converted[key] = nested;
          } else {
            converted[key] = value;
          }
        }
        return converted;
      });

      const Model = mongoose.connection.collection(collection);
      await Model.insertMany(convertedData);
      console.log(`✓ Imported ${convertedData.length} documents to ${collection}`);
    }

    console.log('\nImport completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

importData();

