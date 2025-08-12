import {Request, Response, Router} from 'express';
import {createMessage, getMessagesBetweenUsers} from "../controllers/message";
const router = Router()

router.post("/send", (req: Request, res: Response) => {
    createMessage(req,res);
})
router.get("/messages/:id", (req: Request, res: Response) => {
    getMessagesBetweenUsers(req,res);
})

export default router;