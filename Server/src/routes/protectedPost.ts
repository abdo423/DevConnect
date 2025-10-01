// Protected routes

import { Router, Response, Request } from 'express';
import {
  createPost,
  deletePost,
  getCommentsByPostIdArray,
  likePost,
  updatePost,
} from '../controllers/post';
('');

const protectedRoutes = Router();

protectedRoutes.post('/create', (req: Request, res: Response) => {
  createPost(req, res);
});

protectedRoutes.delete('/delete/:id', (req: Request, res: Response) => {
  deletePost(req, res);
});

protectedRoutes.patch('/update/:id', (req: Request, res: Response) => {
  updatePost(req, res);
});

protectedRoutes.post('/like/:id', (req: Request, res: Response) => {
  likePost(req, res);
});

protectedRoutes.get('/comments/:id', (req: Request, res: Response) => {
  getCommentsByPostIdArray(req, res);
});
export default protectedRoutes;
