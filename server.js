import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import connectDB from './db/connectDB.js';
import cors from 'cors';
const PORT = process.env.PORT || 5003;
import cookieParser from 'cookie-parser';
import orderRoutes from './routes/orderRoutes.js';
// import { notFound, errorHandler } from '@your-scope/common/src/errors.js';

const app = express();
app.use(cookieParser());
//  db connect
connectDB()
app.use(cors({
  origin: 'http://localhost:5173', // ✅ Frontend URL
  credentials: true                // ✅ Required to send cookies/JWT
}));

app.use(express.json());

app.get('/orderhealth', (_, res) => res.json({ ok: true, service: 'order-service' }));
app.use('/orderRoutes', orderRoutes);
// app.use(notFound); app.use(errorHandler);

// await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/users');

app.listen(PORT, () => console.log(`order-service :${PORT}`));