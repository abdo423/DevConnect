import {Request, Response, Router} from 'express';
import {createMessage, getMessagesbetweenUsers} from "../controllers/Message";
const router = Router()

router.post("/send", (req: Request, res: Response) => {
    createMessage(req,res);
})
router.get("/messages/:id", (req: Request, res: Response) => {
    getMessagesbetweenUsers(req,res);
})

export default router;