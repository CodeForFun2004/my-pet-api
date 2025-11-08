const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGO_URL;

const connectDB = async () => {
   try {
       await mongoose.connect(mongoURL );
      // await mongoose.connect("mongodb+srv://huydqds180257:knvqmEdkbPIBFnPd@backenddb.n2u4owd.mongodb.net/my_pet?retryWrites=true&w=majority&appName=BackendDB");
      console.log('MongoDB connected successfully');
   } catch (err) {
      console.error('Error connecting MongoDB:npm', err.message);
      process.exit(1);
   }
};

module.exports = connectDB; 