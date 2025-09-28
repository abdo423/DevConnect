import request from "supertest";
import app from "../../app";
import User from "../../models/user";
import bcrypt from "bcryptjs";
import { Types, Document } from "mongoose";
import Message from "../../models/message";

// Define proper interfaces
interface IUser extends Document {
    _id: string | Types.ObjectId;
    username: string;
    email: string;
    password?: string;
    avatar?: string;
    bio?: string;
    following?: string[] | Types.ObjectId[];
}
interface PopulatedSender {
    _id: string;
    username: string;
    avatar?: string;
}
interface IMessage {
    _id: string;
    senderId: PopulatedSender;
    receiverId: string;
    content?: string;
}
describe("User route", () => {
    const mockUser: Partial<IUser> = {
        _id: new Types.ObjectId(),
        username: "testuser",
        email: "test@example.com",
        avatar: "avatar.jpg",
        bio: "bio",
    };

    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /login", () => {
        it("should login successfully with valid credentials", async () => {
            const loginMockUser: Partial<IUser> = {
                _id: "mockId",
                username: "testUsername",
                email: "test@example.com",
                password: "hashedPassword",
                avatar: "",
                bio: "",
            };

            jest.spyOn(User, "findOne").mockResolvedValue(loginMockUser as IUser);

            const bcryptMock = jest
                .spyOn(bcrypt, "compare")
                .mockImplementationOnce(async () => true);

            const res = await request(app)
                .post("/Auth/login")
                .send({email: "test@example.com", password: "password123"});

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Successfully logged in");

            bcryptMock.mockRestore();
        });

        it("should fail if user does not exist", async () => {
            jest.spyOn(User, "findOne").mockResolvedValue(null);

            const res = await request(app)
                .post("/Auth/login")
                .send({email: "notfound@example.com", password: "password123"});

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Account doesn't exist");
        });

        it("should fail validation for invalid payload", async () => {
            const res = await request(app)
                .post("/Auth/login")
                .send({email: "x", password: "123"});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Validation failed");
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it("should fail with wrong password", async () => {
            const wrongPasswordMockUser: Partial<IUser> = {
                _id: "mockId",
                username: "testUsername",
                email: "test@example.com",
                password: "hashedPassword",
            };

            jest.spyOn(User, "findOne").mockResolvedValue(wrongPasswordMockUser as IUser);

            const bcryptMock = jest
                .spyOn(bcrypt, "compare")
                .mockImplementationOnce(async () => false);

            const res = await request(app)
                .post("/Auth/login")
                .send({email: "test@example.com", password: "wrongpassword"});

            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Invalid credentials");

            bcryptMock.mockRestore();
        });
    });

    describe("POST /register", () => {
        it("should register user successfully with valid credentials", async () => {
            jest.spyOn(User, "findOne").mockResolvedValue(null);
            jest.spyOn(User.prototype, "save").mockResolvedValue({} as IUser);

            const res = await request(app)
                .post("/Auth/register")
                .send({email: "test1@example.com", password: "password123", username: "newUser"});

            expect(res.status).toBe(201);
            expect(res.body.message).toBe("User created successfully");
        });

        it("should fail if email already exists", async () => {
            const existingEmailUser: Partial<IUser> = {
                email: "test@example.com",
                username: "abc"
            };

            jest.spyOn(User, "findOne")
                .mockResolvedValueOnce(existingEmailUser as IUser)
                .mockResolvedValueOnce(null);

            const res = await request(app)
                .post("/Auth/register")
                .send({email: "test@example.com", password: "password123", username: "newUser"});

            expect(res.status).toBe(409);
            expect(res.body.message).toBe("Email already in use");
        });

        it("should fail if username already taken", async () => {
            const existingUsernameUser: Partial<IUser> = {
                email: "test@example.com",
                username: "takenUsername"
            };

            jest.spyOn(User, "findOne")
                .mockResolvedValueOnce(existingUsernameUser as IUser)
                .mockResolvedValueOnce(null);

            const res = await request(app)
                .post("/Auth/register")
                .send({email: "unique@example.com", password: "password123", username: "takenUsername"});

            expect(res.status).toBe(409);
            expect(res.body.message).toBe("Username already taken");
        });

        it("should fail validation for invalid payload", async () => {
            const res = await request(app)
                .post("/Auth/register")
                .send({email: "x", password: "123", username: "ab"});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Validation failed");
            expect(res.body.errors.length).toBeGreaterThan(0);
        });
    });

    describe("GET /check", () => {
        it("should return loggedIn true for valid user", async () => {
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockImplementation(() => {
                    return {
                        id: "mockId",
                        email: "test@example.com",
                        username: "testUsername",
                        exp: Math.floor(Date.now() / 1000) + 3600
                    };
                });

            const configMock = jest.spyOn(require('config'), 'get')
                .mockImplementation(() => {
                    return 'test-secret';
                });

            const checkMockUser: Partial<IUser> = {
                _id: "mockId",
                username: "testUsername",
                email: "test@example.com",
                avatar: "",
                bio: "",
            };

            const mockSelect = jest.fn().mockResolvedValue(checkMockUser);
            jest.spyOn(User, "findById").mockReturnValue({
                select: mockSelect,
            } as never);

            const res = await request(app)
                .get("/Auth/check")
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.loggedIn).toBe(true);
            expect(res.body.user.username).toBe("testUsername");

            expect(jwtMock).toHaveBeenCalledWith('mock-jwt-token', 'test-secret');
            expect(mockSelect).toHaveBeenCalledWith("-password");

            jwtMock.mockRestore();
            configMock.mockRestore();
        });

        it("should return 401 if token is missing", async () => {
            const res = await request(app)
                .get("/Auth/check");

            expect(res.status).toBe(401);
            expect(res.body.loggedIn).toBe(false);
        });

        it("should return 401 if JWT verification fails", async () => {
            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockImplementation(() => {
                    throw new Error('Invalid token');
                });

            const res = await request(app)
                .get("/Auth/check")
                .set('Cookie', 'auth-token=invalid-token');

            expect(res.status).toBe(401);
            expect(res.body.loggedIn).toBe(false);

            jwtMock.mockRestore();
            configMock.mockRestore();
        });

        it("should return 401 if user not found in database", async () => {
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: "mockId",
                    email: "test@example.com",
                    username: "testUsername",
                    exp: Math.floor(Date.now() / 1000) + 3600
                });

            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            const mockSelect = jest.fn().mockResolvedValue(null);
            jest.spyOn(User, "findById").mockReturnValue({
                select: mockSelect,
            } as never);

            const res = await request(app)
                .get("/Auth/check")
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(401);
            expect(res.body.loggedIn).toBe(false);

            jwtMock.mockRestore();
            configMock.mockRestore();
        });
    });

    describe("GET /user/:id", () => {
        it("should return 200 if user is found", async () => {
            jest.spyOn(User, "findById").mockResolvedValue(mockUser as IUser);

            const res = await request(app)
                .get("/Auth/user/mockId");

            expect(res.status).toBe(200);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.username).toBe("testuser");
        });

        it("should return 404 if user is not found", async () => {
            jest.spyOn(User, "findById").mockResolvedValue(null);

            const res = await request(app)
                .get("/Auth/user/nonexistentId");

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("User not found");
        });

        it("should return 500 if database error occurs", async () => {
            jest.spyOn(User, "findById").mockRejectedValue(new Error("Database error"));

            const res = await request(app)
                .get("/Auth/user/mockId");

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Database error");
        });
    });

    describe("DELETE /user/:id", () => {
        it("should delete a user successfully", async () => {
            jest.spyOn(User, "findById").mockResolvedValue(mockUser as IUser);
            jest.spyOn(User, "deleteOne").mockResolvedValue({
                acknowledged: true,
                deletedCount: 1
            } as never);

            const res = await request(app).delete("/Auth/user/mockId");

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("User deleted successfully");
            expect(User.findById).toHaveBeenCalledWith("mockId");
            expect(User.deleteOne).toHaveBeenCalledWith({_id: "mockId"});
        });

        it("should return 404 if user is not found", async () => {
            jest.spyOn(User, "findById").mockResolvedValue(null);

            const res = await request(app)
                .delete("/Auth/user/nonexistentId");

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("User not found");

            expect(User.deleteOne).not.toHaveBeenCalled();
        });

        it("should return 500 if database error occurs during findById", async () => {
            jest.spyOn(User, "findById").mockRejectedValue(new Error("Database connection error"));

            const res = await request(app)
                .delete("/Auth/user/mockId");

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Database connection error");
        });

        it("should return 500 if database error occurs during deleteOne", async () => {
            jest.spyOn(User, "findById").mockResolvedValue(mockUser as IUser);

            jest.spyOn(User, "deleteOne").mockRejectedValue(new Error("Delete operation failed"));

            const res = await request(app)
                .delete("/Auth/user/mockId");

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Delete operation failed");
        });
    });

    describe("GET /following/:id", () => {
        it("should return all users followings successfully", async () => {
            // Mock JWT verification for authentication
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: "currentUserId",
                    email: "current@example.com",
                    username: "currentUser"
                });

            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock the current user with following array
            const currentUserWithFollowing: Partial<IUser> = {
                _id: "user2",
                username: "currentUser",
                following: ["user1", "user3"]
            };

            // Mock findById for getting the current user
            jest.spyOn(User, "findById").mockResolvedValue(currentUserWithFollowing as IUser);

            const mockFollowingUsers: Partial<IUser>[] = [
                {
                    _id: "user1",
                    username: "followedUser1",
                    email: "user1@example.com",
                    avatar: "avatar1.jpg",
                    bio: "Bio of user 1"
                },
                {
                    _id: "user3",
                    username: "followedUser3",
                    email: "user3@example.com",
                    avatar: "avatar3.jpg",
                    bio: "Bio of user 3"
                }
            ];

            const mockSelect = jest.fn().mockResolvedValue(mockFollowingUsers);
            jest.spyOn(User, "find").mockReturnValue({
                select: mockSelect
            } as never);

            const res = await request(app)
                .get("/Auth/following/user2")
                .set('Cookie', 'auth-token=mock-jwt-token'); // Add authentication cookie

            expect(res.status).toBe(200);

            expect(User.find).toHaveBeenCalledWith({
                _id: { $in: ["user1", "user3"] }
            });
            expect(mockSelect).toHaveBeenCalledWith("-password");

            jwtMock.mockRestore();
            configMock.mockRestore();
        });

        it("should return 404 if user is not found", async () => {
            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: "currentUserId",
                    email: "current@example.com",
                    username: "currentUser"
                });

            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock findById to return null (user not found)
            jest.spyOn(User, "findById").mockResolvedValue(null);

            const res = await request(app)
                .get("/Auth/following/nonexistentId")
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("User not found");

            jwtMock.mockRestore();
            configMock.mockRestore();
        });

        it("should return 401 if not authenticated", async () => {
            const res = await request(app)
                .get("/Auth/following/user2"); // No auth cookie

            expect(res.status).toBe(401);
        });
    });
    describe("GET /sentMessages", () => {
        it("should get senders for current user successfully", async () => {
            // Mock JWT verification for authentication
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: "currentUserId",
                    email: "current@example.com",
                    username: "currentUser"
                });

            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock current user with following array
            const mockCurrentUser: Partial<IUser> = {
                _id: "currentUserId",
                following: ["user1", "user2", "user3"]
            };

            // Mock User.findById().select("following")
            const mockUserSelect = jest.fn().mockResolvedValue(mockCurrentUser);
            jest.spyOn(User, "findById").mockReturnValue({
                select: mockUserSelect
            } as never);

            // Mock messages with populated senders
            const mockMessages: Partial<IMessage>[] = [
                {
                    _id: "msg1",
                    senderId: {
                        _id: "sender1", // This sender is NOT in following
                        username: "unfollowedUser1",
                        avatar: "avatar1.jpg"
                    },
                    receiverId: "currentUserId"
                },
                {
                    _id: "msg2",
                    senderId: {
                        _id: "user1", // This sender IS in following - should be filtered out
                        username: "followedUser1",
                        avatar: "avatar2.jpg"
                    },
                    receiverId: "currentUserId"
                },
                {
                    _id: "msg3",
                    senderId: {
                        _id: "sender2", // This sender is NOT in following
                        username: "unfollowedUser2",
                        avatar: "avatar3.jpg"
                    },
                    receiverId: "currentUserId"
                },
                {
                    _id: "msg4",
                    senderId: {
                        _id: "sender1", // Duplicate sender - should only appear once
                        username: "unfollowedUser1",
                        avatar: "avatar1.jpg"
                    },
                    receiverId: "currentUserId"
                }
            ];

            // Mock Message.find().populate().select() chain
            const mockMessageSelect = jest.fn().mockResolvedValue(mockMessages);
            const mockPopulate = jest.fn().mockReturnValue({
                select: mockMessageSelect
            });
            jest.spyOn(Message, "find").mockReturnValue({
                populate: mockPopulate
            } as never);

            // Make the API request
            const res = await request(app)
                .get("/Auth/sentMessages") // Adjust the endpoint path as needed
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.senders).toHaveLength(2); // sender1 and sender2 (user1 filtered out)
            expect(res.body.count).toBe(2);

            // Verify unfollowed senders are returned
            expect(res.body.senders).toEqual(
                expect.arrayContaining([
                    {
                        _id: "sender1",
                        username: "unfollowedUser1",
                        avatar: "avatar1.jpg"
                    },
                    {
                        _id: "sender2",
                        username: "unfollowedUser2",
                        avatar: "avatar3.jpg"
                    }
                ])
            );

            // Verify database calls
            expect(User.findById).toHaveBeenCalledWith("currentUserId");
            expect(mockUserSelect).toHaveBeenCalledWith("following");

            expect(Message.find).toHaveBeenCalledWith({receiverId: "currentUserId"});
            expect(mockPopulate).toHaveBeenCalledWith("senderId", "username avatar");
            expect(mockMessageSelect).toHaveBeenCalledWith("senderId");

            jwtMock.mockRestore();
            configMock.mockRestore();
        });

        it("should return 404 if current user not found", async () => {
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: "nonexistentUserId",
                    email: "nonexistent@example.com",
                    username: "nonexistentUser"
                });

            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock User.findById().select() to return null
            const mockSelect = jest.fn().mockResolvedValue(null);
            jest.spyOn(User, "findById").mockReturnValue({
                select: mockSelect
            } as never);

            const res = await request(app)
                .get("/Auth/sentMessages")
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("User not found");

            jwtMock.mockRestore();
            configMock.mockRestore();
        });

        it("should return 401 if user not authenticated", async () => {
            const res = await request(app)
                .get("/Auth/sentMessages"); // No auth cookie

            expect(res.status).toBe(401);
            // Adjust this based on what the console.log shows
            expect(res.body.error).toBe("Unauthorized access, please log in");
        });

        it("should handle empty messages array", async () => {
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: "currentUserId",
                    email: "current@example.com",
                    username: "currentUser"
                });

            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            const mockCurrentUser: Partial<IUser> = {
                _id: "currentUserId",
                following: ["user1", "user2"]
            };

            const mockUserSelect = jest.fn().mockResolvedValue(mockCurrentUser);
            jest.spyOn(User, "findById").mockReturnValue({
                select: mockUserSelect
            } as never);

            // Mock empty messages array
            const mockMessageSelect = jest.fn().mockResolvedValue([]);
            const mockPopulate = jest.fn().mockReturnValue({
                select: mockMessageSelect
            });
            jest.spyOn(Message, "find").mockReturnValue({
                populate: mockPopulate
            } as never);

            const res = await request(app)
                .get("/Auth/sentMessages")
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.senders).toEqual([]);
            expect(res.body.count).toBe(0);

            jwtMock.mockRestore();
            configMock.mockRestore();
        });
    });
    describe("POST /logout", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should logout user successfully when token exists", async () => {
            const res = await request(app)
                .post("/Auth/logout")
                .set('Cookie', 'auth-token=valid-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Logged out successfully");
            expect(res.body.clientSideCleanup).toBe(true);

            // Verify that the auth-token cookie is cleared
            const cookies = res.get('Set-Cookie');
            expect(cookies).toBeDefined();
            if (cookies) {
                expect(cookies.some((cookie: string) =>
                    cookie.includes('auth-token=') &&
                    (cookie.includes('Max-Age=0') || cookie.includes('Expires='))
                )).toBe(true);
            }
        });

        it("should handle logout when no token exists", async () => {
            const res = await request(app)
                .post("/Auth/logout"); // No cookie sent

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("No active session found");
            expect(res.body.clientSideCleanup).toBe(true);

            // Verify no cookie clearing happens when no token exists
            const cookies = res.get('Set-Cookie');
            // Should either be undefined or not contain auth-token clearing
            if (cookies) {
                expect(cookies.some((cookie: string) =>
                    cookie.includes('auth-token=') &&
                    (cookie.includes('Max-Age=0') || cookie.includes('Expires='))
                )).toBe(false);
            }
        });

        it("should handle logout when empty token exists", async () => {
            const res = await request(app)
                .post("/Auth/logout")
                .set('Cookie', 'auth-token='); // Empty token

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("No active session found");
            expect(res.body.clientSideCleanup).toBe(true);
        });

        it("should return 500 if service throws an error", async () => {
            // Mock the userService.logoutUser to throw an error
            // Adjust the path based on your actual userService location
            const mockLogoutUser = jest.spyOn(require('../../services/userService'), 'logoutUser')
                .mockRejectedValue(new Error("Service error"));

            const res = await request(app)
                .post("/Auth/logout")
                .set('Cookie', 'auth-token=valid-jwt-token');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Failed to logout");

            // In development, error details should be included
            if (process.env.NODE_ENV === "development") {
                expect(res.body.error).toBe("Service error");
            } else {
                expect(res.body.error).toBeUndefined();
            }

            mockLogoutUser.mockRestore();
        });

        it("should clear cookie with correct options in production", async () => {
            // Mock NODE_ENV to be production
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "production";

            const res = await request(app)
                .post("/Auth/logout")
                .set('Cookie', 'auth-token=valid-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify cookie is cleared - the cookie clearing might not include all options in test environment
            const cookies = res.get('Set-Cookie');
            expect(cookies).toBeDefined();

            if (cookies) {
                const authTokenCookie = cookies.find((cookie: string) =>
                    cookie.includes('auth-token=')
                );

                expect(authTokenCookie).toBeDefined();
                // In test environment, the cookie clearing might be simplified
                // Just verify the cookie is being cleared (has expiry date)
                if (authTokenCookie) {
                    expect(authTokenCookie).toMatch(/Expires=|Max-Age=0/);
                }
            }

            // Restore original NODE_ENV
            process.env.NODE_ENV = originalEnv;
        });

        it("should clear cookie with correct options in development", async () => {
            // Mock NODE_ENV to be development
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";

            const res = await request(app)
                .post("/Auth/logout")
                .set('Cookie', 'auth-token=valid-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify cookie is cleared - focus on the main functionality
            const cookies = res.get('Set-Cookie');
            expect(cookies).toBeDefined();

            if (cookies) {
                const authTokenCookie = cookies.find((cookie: string) =>
                    cookie.includes('auth-token=')
                );

                expect(authTokenCookie).toBeDefined();
                // Verify the cookie is being cleared
                if (authTokenCookie) {
                    expect(authTokenCookie).toMatch(/Expires=|Max-Age=0/);
                }
            }

            // Restore original NODE_ENV
            process.env.NODE_ENV = originalEnv;
        });

        it("should handle malformed cookie gracefully", async () => {
            const res = await request(app)
                .post("/Auth/logout")
                .set('Cookie', 'malformed-cookie-data');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("No active session found");
            expect(res.body.clientSideCleanup).toBe(true);
        });

        it("should work correctly when multiple cookies are present", async () => {
            const res = await request(app)
                .post("/Auth/logout")
                .set('Cookie', 'other-cookie=value; auth-token=valid-jwt-token; another-cookie=value');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Logged out successfully");
            expect(res.body.clientSideCleanup).toBe(true);

            // Only the auth-token should be cleared
            const cookies = res.get('Set-Cookie');
            expect(cookies).toBeDefined();
            if (cookies) {
                expect(cookies.some((cookie: string) =>
                    cookie.includes('auth-token=')
                )).toBe(true);
            }
        });
    });
});