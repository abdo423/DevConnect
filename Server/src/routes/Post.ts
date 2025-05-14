import {Request, Response, Router} from 'express';
import {createPost, getPosts, deletePost, updatePost, likePost, getCommentsByPostIdArray} from '../controllers/Post';
const router = Router();

// Logging middleware
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

router.post("/create", (req: Request, res: Response) => {
    createPost(req, res);
});

router.get("/all", (req: Request, res: Response) => {
    getPosts(req, res);
})
router.delete("/delete/:id", (req: Request, res: Response) => {
    deletePost(req, res);
})
router.patch("/update/:id", (req: Request, res: Response) => {
    updatePost(req, res);
})
router.post("/like/:id", (req: Request, res: Response) => {
    likePost(req,res);
})

router.get("/comments/:id", (req: Request, res: Response) => {
    getCommentsByPostIdArray(req, res);
})
export default router;