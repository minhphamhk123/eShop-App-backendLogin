import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Nạp biến môi trường từ `.env.local` trước khi truy cập
dotenv.config();

export const connectDB = mongoose.connect(process.env.MONGO);