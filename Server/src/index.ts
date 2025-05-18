import dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import config from 'config';
import mongoose from "mongoose";
import userRoutes from './routes/auth';
import cookieParser from "cookie-parser";
import cors from "cors";
import {Request, Response, NextFunction} from "express";
import commentRoutes from "./routes/comment";
import authCheck, {authMiddleware, checkTokenExpiration} from "./middlewares/auth";
import postRoutes from "./routes/Post";
import profileRoutes from "./routes/Profile";
const app = express();
app.use(express.json({limit: '10mb'}));
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

app.use(express.urlencoded({extended: true, limit: '10mb'}));

//routes
app.use("/Auth", userRoutes);
postRoutes(app, authMiddleware);
app.use("/Comment", authMiddleware, commentRoutes);
app.use("/Profile", authMiddleware, profileRoutes);

const port = config.get('app.port');
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});