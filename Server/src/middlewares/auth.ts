import jwt from 'jsonwebtoken';
import config from "config";
import { Request, Response, NextFunction } from "express";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

// Declare the user type for better type safety
interface JWTPayload {
    id: string;
    email?: string;
    username?: string;
    avatar?: string;
    bio?: string;
    role?: string;
    exp?: number;
    [key: string]: any;
}

// Extend the Express Request to include `user`
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

/**
 * Middleware to authenticate requests using JWT token from Authorization header
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.get<string>("jwt.secret")) as JWTPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            res.status(401).json({ message: 'Unauthorized: Token expired' });
        } else if (error instanceof JsonWebTokenError) {
            res.status(403).json({ message: 'Forbidden: Invalid token' });
        } else {
            res.status(500).json({ message: 'Authentication error' });
        }
        return;
    }
};

/**
 * Middleware to check token expiration without blocking the request
 */
export const checkTokenExpiration = (req: Request, res: Response, next: NextFunction): void => {
    // Get token from cookies, headers, or body
    const token = req.cookies?.['auth-token'] || // Fixed cookie name to match authCheck
        (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization?.split(' ')[1]) ||
        req.body?.token;

    if (!token) {
        next(); // No token to check
        return;
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, config.get<string>("jwt.secret")) as JWTPayload;

        if (!decoded || typeof decoded.exp !== 'number') {
            res.clearCookie("auth-token"); // Fixed cookie name
            next();
            return;
        }

        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.exp < currentTime) {
            // Token expired - clear it
            res.clearCookie("auth-token"); // Fixed cookie name
            next();
            return;
        }

        // Token is valid, attach to request
        req.user = decoded;
        next();
        return;
    } catch (error) {
        // Malformed token - clear it
        res.clearCookie("auth-token"); // Fixed cookie name
        next();
        return;
    }
};

/**
 * Main authentication check middleware
 */
export const authCheck = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies['auth-token'];

    if (!token) {
        res.status(401).json({ error: "Unauthorized access, please try again" });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.get<string>("jwt.secret")) as JWTPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            res.status(401).json({ error: "Token expired" });
        } else if (error instanceof JsonWebTokenError) {
            res.status(401).json({ error: "Invalid token" });
        } else {
            res.status(500).json({ error: "Authentication failed" });
        }
        return;
    }
};

export default authCheck;