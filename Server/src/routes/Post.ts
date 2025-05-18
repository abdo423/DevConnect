import { Request, Response, Router } from 'express';
import {
    createPost,
    getPosts,
    deletePost,
    updatePost,
    likePost,
    getCommentsByPostIdArray
} from '../controllers/Post';

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

export default (app: any, authMiddleware: any) => {
    // Mount the public route
    app.use("/Post", router);

    // Protected routes
    const protectedRoutes = Router();

    protectedRoutes.post("/create", (req: Request, res: Response) => {
        createPost(req, res);
    });

    protectedRoutes.delete("/delete/:id", (req: Request, res: Response) => {
        deletePost(req, res);
    });

    protectedRoutes.patch("/update/:id", (req: Request, res: Response) => {
        updatePost(req, res);
    });

    protectedRoutes.post("/like/:id", (req: Request, res: Response) => {
        likePost(req, res);
    });

    protectedRoutes.get("/comments/:id", (req: Request, res: Response) => {
        getCommentsByPostIdArray(req, res);
    });

    app.use("/Post", authMiddleware, protectedRoutes);
};
