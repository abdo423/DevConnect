import {
    registerUser,
    loginUser,
    deleteUser,
    logoutUser,
    loginUserCheck,
    getUser,
    getSendersForCurrentUser
} from '../controllers/User';
import {Request, Response, Router} from 'express';
import {getAllFollowings} from "../controllers/User";

const router = Router();
const protectedRoute = Router();
// Logging middleware
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});



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
router.get("/check", (req: Request, res: Response) => {
    loginUserCheck(req, res);
})
// Test route
router.get('/healthcheck', (req: Request, res: Response) => {
    res.status(200).json({status: 'OK'});
});

router.get("/user/:id", (req: Request, res: Response) => {
    getUser(req, res);
});

router.delete("/user/:id", (req: Request, res: Response) => {
    deleteUser(req, res);
})

protectedRoute.get("/following/:id", (req: Request, res: Response) => {
    getAllFollowings(req,res);
})
protectedRoute.get("/sentMessages", (req: Request, res: Response) => {
 getSendersForCurrentUser(req,res);

})
export default (app: any, authMiddleware: any) => {
    app.use('/Auth', router);
    app.use('/Auth', authMiddleware, protectedRoute);
};