import {Request, Response} from 'express';
import User from '../models/user';
import Message from "../models/message";
import * as userService from "../services/userService";



export const loginUser = async (req: Request, res: Response) => {
    try {
        const {user, token} = await userService.loginUser(req.body);
        res.status(200).cookie("auth-token", token, {
            httpOnly: false,
            secure: false,
            sameSite: "strict",
            maxAge: 3 * 60 * 60 * 1000,
        }).json({
            success: true,
            message: "Successfully logged in",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
            },
        });

    } catch (err: any) {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Server error",
            errors: err.errors || undefined,
        });
    }

}

export const registerUser = async (req: Request, res: Response) => {
    try {
        const userData = await userService.registerUser(req.body); // ✅ service call

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: userData,
        });
    } catch (err: any) {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Server error",
            errors: err.errors || undefined,
        });
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    try {
        const tokenExists = Boolean(req.cookies["auth-token"]);
        const result = await userService.logoutUser(tokenExists);

        if (tokenExists) {
            res.clearCookie("auth-token", {
                httpOnly: false,
                secure: false,
                sameSite: "strict",
            });
        }

        res.status(200).json({
            success: true,
            message: result.alreadyLoggedOut
                ? "No active session found"
                : "Logged out successfully",
            clientSideCleanup: true, // frontend hint to remove token from memory
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to logout",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

export const loginUserCheck = async (req: Request, res: Response) => {
    const token = req.cookies["auth-token"];
    if (!token) {
        return res.status(401).json({loggedIn: false});
    }

    try {
        const result = await userService.loginUserCheck(req.user?.id);

        res.status(200).json(result);
    } catch (err: any) {
        res.status(err.status || 401).json({
            loggedIn: false,
            ...(process.env.NODE_ENV === "development" ? {error: err.message} : {}),
        });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await userService.getUser(req.params.id);
        res.status(200).json({ user });
    } catch (err: any) {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const result = await userService.deleteUser(req.params.id);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
};

export const getAllFollowings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await userService.getAllFollowings(id);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
};

export const getSendersForCurrentUser = async (req: Request, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const result = await userService.getSendersForCurrentUser(req.user.id);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
};
