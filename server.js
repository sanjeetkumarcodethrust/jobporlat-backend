import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api', require('./routes/applicationRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Job Portal API' });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
