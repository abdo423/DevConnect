import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import config from 'config';
import { Request, Response, NextFunction } from 'express';

/**
 * JWT Payload type
 */
interface JWTPayload {
  id: string;
  email?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Extend Express Request to hold user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Utility to verify a JWT token
 */
const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, config.get<string>('jwt.secret')) as JWTPayload;
  } catch {
    return null;
  }
};

/**
 * Middleware: Strict auth check using only cookie token
 */
export const authCheck = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies['auth-token'];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized access, please log in' });
    return;
  }

  try {
    req.user = jwt.verify(
      token,
      config.get<string>('jwt.secret'),
    ) as JWTPayload;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (error instanceof JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
};

/**
 * Middleware: Soft check for token expiration without blocking request
 * (Optional - use for routes where login is not mandatory)
 */
export const checkTokenExpiration = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies['auth-token'];
  if (!token) return next();

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded.exp !== 'number') {
    res.clearCookie('auth-token');
    return next();
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (decoded.exp < currentTime) {
    res.clearCookie('auth-token');
    return next();
  }

  req.user = decoded;
  next();
};
