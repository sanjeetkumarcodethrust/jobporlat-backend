const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('Ensure MongoDB is running locally or check your MONGO_URI in .env');
    // process.exit(1);
  }
};

module.exports = connectDB;
