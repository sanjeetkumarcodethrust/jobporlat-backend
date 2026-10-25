import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('MongoDB Error: MONGO_URI environment variable is not defined in .env');
    return;
  }

  // Resolve SRV lookups reliably on Windows networks by using Google & Cloudflare DNS
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch {
      // Ignore if setting DNS servers fails
    }
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (error.message.toLowerCase().includes('bad auth') || error.message.toLowerCase().includes('authentication failed')) {
      console.error('Hint: Authentication failed. Please check the MongoDB username and password in .env, or reset the password in MongoDB Atlas (Security -> Database Access).');
    } else if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('Hint: Network or DNS error. Ensure your IP is whitelisted in MongoDB Atlas (Network Access -> Add IP Address -> Allow Access from Anywhere 0.0.0.0/0).');
    }
    console.warn('MongoDB connection failed – server will continue (development mode)');
  }
};

export default connectDB;


