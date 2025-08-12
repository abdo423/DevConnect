import { Request, Response, Router } from 'express';
import {followUser, getProfile, getProfileById, updateProfile} from "../controllers/profile";

const router = Router();
// Logging middleware
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
router.get("/", (req: Request, res: Response) => {
    getProfile(req,res);
});
router.get("/:id", (req: Request, res: Response) => {
    getProfileById(req,res);
});
router.post("/follow/:id", (req: Request, res: Response) => {
    followUser(req,res);
})
router.patch("/update/:id", (req: Request, res: Response) => {
    updateProfile(req,res);
})

export default router;