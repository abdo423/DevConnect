import jwt from 'jsonwebtoken';
import config from "config";
import { Request, Response, NextFunction } from "express";
import {TokenExpiredError,JsonWebTokenError} from "jsonwebtoken";
// Extend the Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: any; // Replace 'any' with your user type if you have one
        }
    }
}

function authCheck(req: Request, res: Response, next: NextFunction) {
    // Get token from cookies (modern Express approach)
    const token = req.cookies['auth-token'];

    if (!token) {
        return res.status(401).json({
            error: "Unauthorized access, please try again",
        });
    }

    try {
        // Verify token with proper type assertion
        const decoded = jwt.verify(token, config.get<string>("jwt.JWT_SECRET"));

        // Attach user to request
        req.user = decoded;
        next();
    } catch (ex) {
        console.log(ex);

        if (ex instanceof TokenExpiredError) {
            return res.status(401).json({ error: "Token expired" });
        }
        else if (ex instanceof JsonWebTokenError) {
            return res.status(401).json({ error: "Invalid token" });
        }
        else if (ex instanceof Error) {
            // Handle other unexpected errors
            return res.status(500).json({ error: "Authentication failed" });
        }

        // Fallback for completely unknown errors
        return res.status(500).json({ error: "Unknown authentication error" });
    }
}

export default authCheck;