import {Request, Response, NextFunction} from 'express';
import  jwt from 'jsonwebtoken';
import  bcrypt from 'bcryptjs';
import User, {validateUser, validateLogin} from '../models/User';
import config from "config";

// Secret for JWT (should be in .env)
const JWT_SECRET = config.get("jwt.secret") as string;
const expiresIn = (config.get("jwt.expiresIn") as string) ;
// api/login
export const loginUser = async (req: Request, res: Response) => {
    const result = validateLogin(req.body);
    if (!result.success) {
        return res.status(400).json({errors: result.error.errors});
    }
    const {email, password} = result.data;
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({
                errors: result.error,
                message: 'Invalid Credentials',
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({errors: result.error, message: 'Invalid credentials'});


        const token = jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: "3h" });

        res.status(200).json({
            token,
            success: true,
            message: 'Successfully logged in',
            user: {
                id: user._id,
                username: user.username,
                email,
                avatar: user.avatar,


            },

        })
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err});
    }

}

// api/register

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

        res.status(201).json({message: 'User registered successfully', user: {username, email}});
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err});
    }

}