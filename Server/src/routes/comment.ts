import {Request, Response, Router} from 'express';
import {createComment, deleteComment, getCommentsByPost, likeComment, updateComment} from "../controllers/comment";

const router = Router();

// Logging middleware
// router.use((req, res, next) => {
//     console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//     next();
// });

router.post("/create", (req: Request, res: Response) => {
    createComment(req,res);
})
router.delete("/delete/:id", (req: Request, res: Response) => {
    deleteComment(req,res);
})
router.patch("/update/:id", (req: Request, res: Response) => {
  updateComment(req,res);
})
router.get("/post/:id", (req: Request, res: Response) => {
    getCommentsByPost(req,res);
})
router.post("/like/:id", (req: Request, res: Response) => {
    likeComment(req,res);
})
export default router;