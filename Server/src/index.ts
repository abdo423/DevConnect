import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import config from 'config';
import mongoose from "mongoose";
import authRoutes from './routes/auth';
import cookieParser from 'cookie-parser';
import cors from "cors";
import {Request, Response, NextFunction} from "express";
import commentRoutes from "./routes/comment";
import { authCheck, checkTokenExpiration } from "./middlewares/auth";
import postRoutes from "./routes/Post";
import profileRoutes from "./routes/Profile";
import messageRoutes from "./routes/Message";
import protectedRoutes from "./routes/protectedAuth";
import protectedPost from "./routes/protectedPost";
const app = express();
app.use(express.json({limit: '10mb'}));
app.use(cookieParser());
app.use(checkTokenExpiration);
app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
}))

// Basic route for health check

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({status: 'OK'});
});

app.use(express.urlencoded({extended: true, limit: '10mb'}));

//routes
app.use("/Auth", authRoutes);
app.use("/Auth", authCheck,protectedRoutes);
app.use("/Post", postRoutes);
app.use("/Post", authCheck,protectedPost);
app.use("/Comment", authCheck, commentRoutes);
app.use("/Profile", authCheck, profileRoutes);
app.use("/Message", authCheck, messageRoutes);


const port = config.get('app.port') as number;
const dbURI = config.get('db.connectionString') as string;

mongoose
    .connect(dbURI) // Optional timeout setting
    .then(() => {
        app.listen(port, () => {
        });
    })
    .catch((err) => {
        process.exit(1); // Stop app if DB fails
    });