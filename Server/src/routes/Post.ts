import { Request, Response, Router } from 'express';
import {
    createPost,
    getPosts,
    deletePost,
    updatePost,
    likePost,
    getCommentsByPostIdArray
} from '../controllers/post';

const router = Router();

// Logging middleware
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Public route (no auth)
router.get("/all", (req: Request, res: Response) => {
    getPosts(req, res);
});
export default router;

