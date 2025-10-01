// src/app.ts
import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authCheck, checkTokenExpiration } from './middlewares/auth';

import authRoutes from './routes/auth';
import commentRoutes from './routes/comment';
import postRoutes from './routes/Post';
import profileRoutes from './routes/Profile';
import messageRoutes from './routes/Message';
import protectedRoutes from './routes/protectedAuth';
import protectedPost from './routes/protectedPost';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(checkTokenExpiration);
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

// Health checks
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/ping', (req: Request, res: Response) => {
  res.json({ message: 'pong' });
});

// Routes
app.use('/Auth', authRoutes);
app.use('/Auth', authCheck, protectedRoutes);
app.use('/Post', postRoutes);
app.use('/Post', authCheck, protectedPost);
app.use('/Comment', authCheck, commentRoutes);
app.use('/Profile', authCheck, profileRoutes);
app.use('/Message', authCheck, messageRoutes);

export default app;
