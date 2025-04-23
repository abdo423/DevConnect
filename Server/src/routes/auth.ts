import {registerUser, loginUser} from '../controllers/User';
import {Request, Response, Router} from 'express';

const router = Router();

// Logging middleware
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Timeout middleware
router.use((req, res, next) => {
    res.setTimeout(5000, () => {
        res.status(503).json({message: 'Request timeout'});
    });
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

// 404 handler
router.use((req, res) => {
    res.status(404).json({message: 'Not Found'});
});

// Error handler
router.use((err: Error, req: Request, res: Response) => {
    console.error(err.stack);
    res.status(500).json({message: 'Internal Server Error'});
});

export default router;