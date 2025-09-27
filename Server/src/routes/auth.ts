import {
    registerUser,
    loginUser,
    deleteUser,
    logoutUser,
    loginUserCheck,
    getUser,
    getSendersForCurrentUser
} from '../controllers/user';
import {Request, Response, Router} from 'express';
import {getAllFollowings} from "../controllers/user";
import {checkTokenExpiration} from "../middlewares/auth";

const router = Router();
// Logging middleware
// router.use((req, res, next) => {
//     console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//     next();
// });



// Routes
router.post("/login", (req: Request, res: Response) => {
    loginUser(req, res);
});
router.post("/register", (req: Request, res: Response) => {
    registerUser(req, res);
});
router.post("/logout", (req: Request, res: Response) => {
    logoutUser(req, res);
})
router.get("/check", checkTokenExpiration, (req: Request, res: Response) => {
    loginUserCheck(req, res);
});
router.get("/user/:id", (req: Request, res: Response) => {
    getUser(req, res);
});

router.delete("/user/:id", (req: Request, res: Response) => {
    deleteUser(req, res);
})


export default router;