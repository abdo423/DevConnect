"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateUser = void 0;
var mongoose_1 = require("mongoose");
var z = require("zod");
var userValidationSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6).max(50),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
});
var loginSchema = z.object({
    email: z.string().min(3).max(30),
    password: z.string().min(6).max(20),
});
var userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 100,
    },
    avatar: {
        type: String,
        default: './assets/avatar.png',
    },
    bio: {
        type: String,
        default: '',
    }
});
var validateUser = function (user) {
    return userValidationSchema.safeParse(user);
};
exports.validateUser = validateUser;
var validateLogin = function (user) {
    return loginSchema.safeParse(user);
};
exports.validateLogin = validateLogin;
var User = mongoose_1.default.model('User', userSchema);
// Exported types for both schemas
exports.default = User;
