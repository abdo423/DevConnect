import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, {validateUser, validateLogin} from '../models/User';
import config from "config";

// Secret for JWT (should be in .env)
const JWT_SECRET = config.get<string>("jwt.secret");
const expiresIn = config.get<string>("jwt.expiresIn");

// Auth/login
export const loginUser = async (req: Request, res: Response) => {
    const result = validateLogin(req.body);

    if (!result.success) {
        return res.status(400).json({errors: result.error.errors});
    }
    const {email, password} = result.data;
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'account  doesn\'t exsist',
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({errors: result.error, message: 'Invalid credentials'});


        const token = jwt.sign(
            {id: user._id, username: user.username, avatar: user.avatar, email: user.email},
            JWT_SECRET,
            {expiresIn: "3h"} // Ensure expiresIn is a string
        );
        res.status(200).cookie("auth-token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax", // protect against CSRF
            maxAge: 3 * 60 * 60 * 1000, // 1 day in milliseconds
        }).json({
            token,
            success: true,
            message: 'Successfully logged in',
            user: {
                id: user._id,
                username: user.username,
                email,
                avatar: user.avatar,
            },
        });

    } catch (err) {
        res.status(500).json({message: 'Server error', error: err});
    }

}

// Auth/register

export const registerUser = async (req: Request, res: Response) => {
    const result = validateUser(req.body);
    if (!result.success) {
        return res.status(400).json({errors: result.error.errors});
    }


    const {username, email, password, bio, avatar} = result.data;

    try {
        const existingUser = await User.findOne({email});
        if (existingUser) return res.status(409).json({message: 'Email already in use'});

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            bio,
            avatar,
        });
        await user.save();

        res.status(201).json({message: 'User created successfully', user: {username, email}});
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err});
    }

}


//Auth/logout
export const logoutUser = async (req: Request, res: Response) => {
    try {
        // Clear the authentication cookie
        res.clearCookie('auth-token');

        // You may also want to invalidate the token on the server side
        // If you're using JWT with a blacklist or a session store
        // For example:
        // await invalidateToken(req.user.id);

        // Send success response
        return res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to logout',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

export const loginUserCheck = async (req: Request, res: Response) => {
    const token = req.cookies["auth-token"];
    if (!token) return res.status(401).json({ loggedIn: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.status(200).json({ loggedIn: true, user: decoded });
    } catch (err) {
        return res.status(401).json({ loggedIn: false });
    }
}

export const getUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ user });
}

export  const deleteUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await User.deleteOne({_id: req.params.id});
    return res.status(200).json({ message: 'User deleted successfully' });
}