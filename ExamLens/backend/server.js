import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health-check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ExamLens API is running'
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`ExamLens backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message || error);
    process.exit(1);
  }
};

connectDatabase();
