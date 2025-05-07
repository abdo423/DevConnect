import dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import config from 'config';
import mongoose from "mongoose";
import userRoutes from './routes/auth';
import cookieParser from "cookie-parser";
import cors from "cors";
import {Request, Response, NextFunction} from "express";
import authCheck, {authMiddleware, checkTokenExpiration} from "./middlewares/auth";
import postRoutes from "./routes/Post";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(checkTokenExpiration);
app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
}))
const dbURI = config.get('db.connectionString') as string;

mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


// Basic route for health check

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({status: 'OK'});
});
//routes
app.use("/Auth", userRoutes);
app.use("/Post",authMiddleware, postRoutes);

const port = config.get('app.port');
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});