import {Request, Response,Router} from "express";
import {getAllFollowings, getSendersForCurrentUser} from "../controllers/user";
const protectedRoutes = Router();
protectedRoutes.get("/following/:id", (req: Request, res: Response) => {
    getAllFollowings(req,res);
})
protectedRoutes.get("/sentMessages", (req: Request, res: Response) => {
    getSendersForCurrentUser(req,res);

})

export  default  protectedRoutes;