import {Request, Response, Router} from 'express';
import {createPost, getPosts, deletePost, updatePost,likePost} from '../controllers/Post';
const router = Router();


router.post("/create", (req: Request, res: Response) => {
    createPost(req, res);
});

router.get("/posts", (req: Request, res: Response) => {
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
export default router;