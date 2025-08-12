import {Request, Response} from 'express';
import * as profileService from "../services/profileService"


export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await profileService.getProfile(req.user!.id);
        res.status(200).json(user);
    } catch (error: any) {
        console.error("Error fetching profile:", error);
        res.status(error.status || 500).json({
            message: error.message || "Server error",
            ...(error.errors && { errors: error.errors }),
        });
    }
};



export const getProfileById = async (req: Request, res: Response) => {
    try {
        const user = await profileService.getProfileById(req.params.id, req.user!.id);
        res.status(200).json(user);
    } catch (error: any) {
        console.error("Error fetching profile:", error);
        res.status(error.status || 500).json({
            message: error.message || "Server error",
            ...(error.errors && { errors: error.errors }),
        });
    }
};


export const followUser = async (req: Request, res: Response) => {
    try {
        const { user, alreadyFollowing } = await profileService.followUser(
            req.params.id,
            req.user!.id
        );

        res.status(200).json({
            user,
            message: alreadyFollowing
                ? "User unfollowed successfully"
                : "User followed successfully",
        });
    } catch (error: any) {
        res.status(error.status || 500).json({
            message: error.message || "Server error",
            ...(error.errors && { errors: error.errors }),
        });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const updatedUser = await profileService.updateProfile(
            req.params.id,
            req.user!.id,
            req.body
        );

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error: any) {
        res.status(error.status || 500).json({
            message: error.message || "Server error",
            ...(error.errors && { errors: error.errors }),
        });
    }
};
