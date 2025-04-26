import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import config from 'config';
import mongoose from "mongoose";
import userRoutes from './routes/auth';
import cookieParser from "cookie-parser";
import cors from "cors";
import {Request, Response, NextFunction} from "express";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors())
const dbURI = config.get('db.connectionString') as string;
console.log('Connecting to:', dbURI); // for debug

mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


// Basic route for health check

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});
//routes
app.use("/auth", userRoutes);

const port = config.get('app.port');
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});