import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.warn('MongoDB connection failed – server will continue (development mode)');
    // Do not exit process so the API remains reachable for front‑end testing
  }
};

export default connectDB;
