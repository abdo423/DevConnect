import { Request, Response, Router } from 'express';
import {getProfile, getProfileById} from "../controllers/Profile";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    getProfile(req,res);
});
router.get("/:id", (req: Request, res: Response) => {
    getProfileById(req,res);
});
export default router;