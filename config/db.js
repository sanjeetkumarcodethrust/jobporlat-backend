import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async (retries = 5, delay = 3000) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('MongoDB Error: MONGO_URI environment variable is not defined in .env');
    return;
  }

  // Windows network fix for mongodb+srv DNS SRV query failures
  // Only apply on Windows; do NOT override on Linux/Render where container DNS is required
  if (uri.startsWith('mongodb+srv://') && process.platform === 'win32') {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch {
      // Ignore if setting DNS servers fails
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`MongoDB Connection Attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`Retrying MongoDB connection in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        if (
          error.message.toLowerCase().includes('bad auth') ||
          error.message.toLowerCase().includes('authentication failed')
        ) {
          console.error('Hint: Authentication failed. Please verify the username and password in MONGO_URI.');
        } else if (
          error.message.includes('querySrv') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ECONNREFUSED')
        ) {
          console.error('Hint: Network or DNS error. Ensure your IP is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access.');
        }
      }
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

export default connectDB;
