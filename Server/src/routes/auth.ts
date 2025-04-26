import {registerUser, loginUser} from '../controllers/User';
import {Request, Response, Router} from 'express';

const router = Router();

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

// Test route
router.get('/healthcheck', (req: Request, res: Response) => {
    res.status(200).json({status: 'OK'});
});




export default router;