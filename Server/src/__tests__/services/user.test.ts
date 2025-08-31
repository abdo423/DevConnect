import * as userService from "../../services/userService";
import User, {validateLogin, validateUser} from "../../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Message from "../../models/message";


// Mock the User model
jest.mock("../../models/user");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../models/message");
describe("User service", () => {
    describe("loginUserCheck service", () => {
        const mockUser = {
            _id: "12345",
            name: "Test User",
            email: "test@example.com",
            toObject: function () {
                return this;
            } // sometimes needed for mongoose docs
        };

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should throw 401 if userId is not provided", async () => {
            await expect(userService.loginUserCheck(undefined))
                .rejects
                .toEqual({status: 401, loggedIn: false});
        });

        it("should throw 401 if user is not found", async () => {
            // @ts-ignore: mock findById
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(userService.loginUserCheck("12345"))
                .rejects
                .toEqual({status: 401, loggedIn: false});
        });

        it("should return loggedIn true with user if found", async () => {
            // @ts-ignore: mock findById
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const result = await userService.loginUserCheck(("12345"));

            expect(result).toEqual({
                loggedIn: true,
                user: mockUser
            });
        });
    });
    describe("loginUser service", () => {
        const mockUser = {
            _id: "123",
            email: "test@example.com",
            username: "testUser",
            bio: "Hello",
            password: "hashedPassword"
        };
        afterEach(() => {
            jest.clearAllMocks();
        });
        it("should throw 400 if validation fails", async () => {
            (validateLogin as jest.Mock).mockReturnValue({
                success: false,
                error: {errors: ["email required"]}
            })
            await expect(userService.loginUser({})).rejects.toEqual({
                status: 400,
                message: "Validation failed",
                errors: ["email required"]
            });
        });
        it("should throw 404 if user is not found", async () => {
            (validateLogin as jest.Mock).mockReturnValue({
                success: true,
                data: {email: "test@example.com", password: "1234"}
            });
            (User.findOne as jest.Mock).mockResolvedValue(null);
            await expect(userService.loginUser({email: "test@example.com", password: "wrong test"})).rejects.toEqual({
                status: 404,
                message: "Account doesn't exist",
            });

        });
        it("should throw 401 if password does not match", async () => {
            (validateLogin as jest.Mock).mockReturnValue({
                success: true,
                data: {email: "test@example.com", password: "wrongPass"}
            });
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(userService.loginUser({email: "test@example.com", password: "wrongPass"}))
                .rejects.toEqual({
                    status: 401,
                    message: "Invalid credentials"
                });
        });
        it("should return token and user on success", async () => {
            (validateLogin as jest.Mock).mockReturnValue({  // Changed from mockResolvedValue
                success: true,
                data: {email: "test@example.com", password: "correctPass123"}
            });
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue("fakeToken");

            const result = await userService.loginUser({email: "test@example.com", password: "correctPass123"});

            expect(result).toEqual({
                token: "fakeToken",
                user: mockUser
            });
        });
    });
    describe("registerUser service", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        })
        const mockUser = {
            _id: "123",
            name: "Test User",
            email: "abdo@gmail.com",
            password: "hashedPassword",
            avatar: "",
            bio: "Hello",
        }
        afterEach(() => {
            jest.clearAllMocks();
        });
        it("should throw 400 if validation fails", async () => {
            (validateUser as jest.Mock).mockReturnValue({
                success: false,
                error: {errors: ["email required"]}
            })
            await expect(userService.registerUser({})).rejects.toEqual({
                status: 400,
                errors: ["email required"],
            })
        });
        it("should throw 409 if email already exist", async () => {
            (validateLogin as jest.Mock).mockReturnValue({
                success: true,
                data: mockUser
            });
            (validateUser as jest.Mock).mockReturnValue({
                success: true,
                data: {
                    username: "newuser",
                    email: "existing@example.com",
                    password: "password123",
                    bio: "New user",
                    avatar: ""
                }
            });


            (User.findOne as jest.Mock).mockImplementation((query) => {
                if (query.email) return Promise.resolve(mockUser); // no duplicate email
                if (query.username) return Promise.resolve(null); // username exists
            });
            await expect(userService.registerUser({
                username: "newuser",
                email: "existing@example.com",
                password: "password123"
            })).rejects.toEqual({
                status: 409,
                message: "Email already in use"
            });

            expect(User.findOne).toHaveBeenCalledWith({email: "existing@example.com"});
        });
        it("should throw 409 if username already exists", async () => {
            (validateUser as jest.Mock).mockReturnValue({
                success: true,
                data: {
                    username: "existinguser",
                    email: "new@example.com",
                    password: "password123",
                    bio: "New user",
                    avatar: ""
                }
            });

            (User.findOne as jest.Mock).mockImplementation((query) => {
                if (query.email) return Promise.resolve(null); // no duplicate email
                if (query.username) return Promise.resolve(mockUser); // username exists
            });

            await expect(userService.registerUser({
                username: "existinguser",
                email: "new@example.com",
                password: "password123"
            })).rejects.toEqual({
                status: 409,
                message: "Username already taken"
            });

            expect(User.findOne).toHaveBeenCalledWith({username: "existinguser"});
        });
        it("should successfully register a new user", async () => {
            const userData = {
                username: "newuser",
                email: "new@example.com",
                password: "password123",
                bio: "Hello world",
                avatar: "avatar.jpg"
            };

            (validateUser as jest.Mock).mockReturnValue({
                success: true,
                data: userData
            });

            // Mock no existing user
            (User.findOne as jest.Mock).mockResolvedValue(null);

            // Mock bcrypt hash
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");

            // Mock User constructor and save
            const mockSave = jest.fn().mockResolvedValue(true);
            // @ts-ignore
            (User as jest.Mock).mockImplementation(() => ({
                save: mockSave
            }));

            const result = await userService.registerUser(userData);

            expect(result).toEqual({
                username: "newuser",
                email: "new@example.com"
            });

            // Verify bcrypt.hash was called
            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

            // Verify User constructor was called with correct data
            expect(User).toHaveBeenCalledWith({
                _id: expect.any(Object), // mongoose.Types.ObjectId
                username: "newuser",
                email: "new@example.com",
                password: "hashedPassword123",
                bio: "Hello world",
                avatar: "avatar.jpg"
            });

            // Verify save was called
            expect(mockSave).toHaveBeenCalled();

            // Verify both findOne calls were made
            expect(User.findOne).toHaveBeenCalledWith({email: "new@example.com"});
            expect(User.findOne).toHaveBeenCalledWith({username: "newuser"});
        });
        it("should handle empty bio and avatar", async () => {
            const userData = {
                username: "testuser2",
                email: "test2@example.com",
                password: "password123",
                bio: "",
                avatar: ""
            };

            (validateUser as jest.Mock).mockReturnValue({
                success: true,
                data: userData
            });

            (User.findOne as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");

            const mockSave = jest.fn().mockResolvedValue(true);
            // @ts-ignore
            (User as jest.Mock).mockImplementation(() => ({
                save: mockSave
            }));

            const result = await userService.registerUser(userData);

            expect(result).toEqual({
                username: "testuser2",
                email: "test2@example.com"
            });

            expect(User).toHaveBeenCalledWith({
                _id: expect.any(Object),
                username: "testuser2",
                email: "test2@example.com",
                password: "hashedPassword123",
                bio: "",
                avatar: ""
            });
        });
    });
    describe("logoutUser service", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should return alreadyLoggedOut true if token does not exist", async () => {
            const result = await userService.logoutUser(false);

            expect(result).toEqual({
                alreadyLoggedOut: true
            });
        });

        it("should return alreadyLoggedOut false if token exists", async () => {
            const result = await userService.logoutUser(true);

            expect(result).toEqual({
                alreadyLoggedOut: false
            });
        });

        it("should handle undefined tokenExists parameter", async () => {
            // @ts-ignore: testing runtime behavior with undefined
            const result = await userService.logoutUser(undefined);

            expect(result).toEqual({
                alreadyLoggedOut: true
            });
        });

        it("should handle null tokenExists parameter", async () => {
            // @ts-ignore: testing runtime behavior with null
            const result = await userService.logoutUser(null);

            expect(result).toEqual({
                alreadyLoggedOut: true
            });
        });
    });
    describe("getUser service", () => {
        it("should return 404 if user not found", async () => {
            (User.findById as jest.Mock).mockResolvedValue(null); // Changed from findOne and undefined

            await expect(userService.getUser("test")).rejects.toEqual({
                status: 404,
                message: "User not found"
            });
        });

        it("should return user if found", async () => {
            const mockUser = {
                _id: "test",
                username: "testuser",
                email: "test@example.com",
                bio: "Hello"
            };

            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.getUser("test");

            expect(result).toEqual(mockUser);
            expect(User.findById).toHaveBeenCalledWith("test");
        });
    })

    describe("deleteUser service", () => {
        it("should return 404 if user not found", async () => {
            (User.findById as jest.Mock).mockResolvedValue(null); // Changed from findOne and undefined

            await expect(userService.deleteUser("test")).rejects.toEqual({
                status: 404,
                message: "User not found"
            });
        });
        it("should return user is deleted", async () => {
            const mockUser = {
                _id: "test",
                username: "testuser",
                email: "test@example.com",
                bio: "Hello"
            };

            // Mock BOTH findById and deleteOne
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (User.deleteOne as jest.Mock).mockResolvedValue({deletedCount: 1});

            const result = await userService.deleteUser("test");

            expect(result).toEqual({
                message: "User deleted successfully"
            });

            // Verify both methods were called
            expect(User.findById).toHaveBeenCalledWith("test");
            expect(User.deleteOne).toHaveBeenCalledWith({_id: "test"});
        });
    });
    describe("getAllFollowings service", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should throw 404 if user not found", async () => {
            (User.findById as jest.Mock).mockResolvedValue(null);

            await expect(userService.getAllFollowings("nonexistent")).rejects.toEqual({
                status: 404,
                message: "User not found"
            });

            expect(User.findById).toHaveBeenCalledWith("nonexistent");
            expect(User.find).not.toHaveBeenCalled(); // Should not attempt to fetch followings
        });

        it("should return empty following list when user has no followings", async () => {
            const mockUser = {
                _id: "user123",
                username: "testuser",
                email: "test@example.com",
                following: [] // Empty following array
            };

            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (User.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue([])
            });

            const result = await userService.getAllFollowings("user123");

            expect(result).toEqual({
                message: "Following users fetched successfully",
                following: []
            });

            expect(User.findById).toHaveBeenCalledWith("user123");
            expect(User.find).toHaveBeenCalledWith({_id: {$in: []}});
        });

        it("should return following users when user has followings", async () => {
            const mockUser = {
                _id: "user123",
                username: "testuser",
                email: "test@example.com",
                following: ["following1", "following2", "following3"]
            };

            const mockFollowingUsers = [
                {
                    _id: "following1",
                    username: "user1",
                    email: "user1@example.com",
                    bio: "User 1 bio"
                },
                {
                    _id: "following2",
                    username: "user2",
                    email: "user2@example.com",
                    bio: "User 2 bio"
                },
                {
                    _id: "following3",
                    username: "user3",
                    email: "user3@example.com",
                    bio: "User 3 bio"
                }
            ];

            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (User.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockFollowingUsers)
            });

            const result = await userService.getAllFollowings("user123");

            expect(result).toEqual({
                message: "Following users fetched successfully",
                following: mockFollowingUsers
            });

            expect(User.findById).toHaveBeenCalledWith("user123");
            expect(User.find).toHaveBeenCalledWith({_id: {$in: ["following1", "following2", "following3"]}});

            // Verify select was called to exclude password
            const findResult = (User.find as jest.Mock).mock.results[0].value;
            expect(findResult.select).toHaveBeenCalledWith("-password");
        });

        it("should handle single following user", async () => {
            const mockUser = {
                _id: "user123",
                username: "testuser",
                email: "test@example.com",
                following: ["following1"]
            };

            const mockFollowingUser = [
                {
                    _id: "following1",
                    username: "user1",
                    email: "user1@example.com",
                    bio: "User 1 bio"
                }
            ];

            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (User.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockFollowingUser)
            });

            const result = await userService.getAllFollowings("user123");

            expect(result).toEqual({
                message: "Following users fetched successfully",
                following: mockFollowingUser
            });

            expect(User.findById).toHaveBeenCalledWith("user123");
            expect(User.find).toHaveBeenCalledWith({_id: {$in: ["following1"]}});
        });

        it("should handle case where some followed users no longer exist", async () => {
            const mockUser = {
                _id: "user123",
                username: "testuser",
                email: "test@example.com",
                following: ["following1", "deletedUser", "following3"]
            };

            // Only 2 users found (deletedUser no longer exists)
            const mockFollowingUsers = [
                {
                    _id: "following1",
                    username: "user1",
                    email: "user1@example.com",
                    bio: "User 1 bio"
                },
                {
                    _id: "following3",
                    username: "user3",
                    email: "user3@example.com",
                    bio: "User 3 bio"
                }
            ];

            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (User.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockFollowingUsers)
            });

            const result = await userService.getAllFollowings("user123");

            expect(result).toEqual({
                message: "Following users fetched successfully",
                following: mockFollowingUsers
            });

            expect(User.findById).toHaveBeenCalledWith("user123");
            expect(User.find).toHaveBeenCalledWith({_id: {$in: ["following1", "deletedUser", "following3"]}});
        });
    });
    describe("getSendersForCurrentUser service", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should throw 404 if current user not found", async () => {
            (User.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(userService.getSendersForCurrentUser("nonexistent")).rejects.toEqual({
                status: 404,
                message: "User not found"
            });

            expect(User.findById).toHaveBeenCalledWith("nonexistent");
            expect(Message.find).not.toHaveBeenCalled();
        });

        it("should return empty senders when no messages exist", async () => {
            const mockCurrentUser = {
                _id: "currentUser123",
                following: ["following1", "following2"]
            };

            (User.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockCurrentUser)
            });

            (Message.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue([])
                })
            });

            const result = await userService.getSendersForCurrentUser("currentUser123");

            expect(result).toEqual({
                senders: [],
                count: 0
            });

            expect(User.findById).toHaveBeenCalledWith("currentUser123");
            expect(Message.find).toHaveBeenCalledWith({receiverId: "currentUser123"});
        });

        it("should return empty senders when user has no following list", async () => {
            const mockCurrentUser = {
                _id: "currentUser123",
                following: null // or undefined
            };

            const mockMessages = [
                {
                    senderId: {
                        _id: "sender1",
                        username: "sender1user",
                        avatar: "avatar1.jpg"
                    }
                }
            ];

            (User.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockCurrentUser)
            });

            (Message.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockMessages)
                })
            });

            const result = await userService.getSendersForCurrentUser("currentUser123");

            expect(result).toEqual({
                senders: [
                    {
                        _id: "sender1",
                        username: "sender1user",
                        avatar: "avatar1.jpg"
                    }
                ],
                count: 1
            });
        });

        it("should exclude followed users from senders", async () => {
            const mockCurrentUser = {
                _id: "currentUser123",
                following: ["sender1", "sender2"] // These users are followed
            };

            const mockMessages = [
                {
                    senderId: {
                        _id: "sender1", // This user is followed - should be excluded
                        username: "followeduser1",
                        avatar: "avatar1.jpg"
                    }
                },
                {
                    senderId: {
                        _id: "sender3", // This user is NOT followed - should be included
                        username: "unfolloweduser",
                        avatar: "avatar3.jpg"
                    }
                }
            ];

            (User.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockCurrentUser)
            });

            (Message.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockMessages)
                })
            });

            const result = await userService.getSendersForCurrentUser("currentUser123");

            expect(result).toEqual({
                senders: [
                    {
                        _id: "sender3",
                        username: "unfolloweduser",
                        avatar: "avatar3.jpg"
                    }
                ],
                count: 1
            });
        });

        it("should return unique unfollowed senders with correct count", async () => {
            const mockCurrentUser = {
                _id: "currentUser123",
                following: ["followedUser1"]
            };

            const mockMessages = [
                {
                    senderId: {
                        _id: "sender1",
                        username: "unfolloweduser1",
                        avatar: "avatar1.jpg"
                    }
                },
                {
                    senderId: {
                        _id: "sender2",
                        username: "unfolloweduser2",
                        avatar: "avatar2.jpg"
                    }
                },
                {
                    senderId: {
                        _id: "sender1", // Duplicate sender - should only appear once
                        username: "unfolloweduser1",
                        avatar: "avatar1.jpg"
                    }
                },
                {
                    senderId: {
                        _id: "followedUser1", // This user is followed - should be excluded
                        username: "followeduser",
                        avatar: "followed.jpg"
                    }
                }
            ];

            (User.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockCurrentUser)
            });

            (Message.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockMessages)
                })
            });

            const result = await userService.getSendersForCurrentUser("currentUser123");

            expect(result).toEqual({
                senders: [
                    {
                        _id: "sender1",
                        username: "unfolloweduser1",
                        avatar: "avatar1.jpg"
                    },
                    {
                        _id: "sender2",
                        username: "unfolloweduser2",
                        avatar: "avatar2.jpg"
                    }
                ],
                count: 2
            });

            // Verify the correct query calls
            expect(User.findById).toHaveBeenCalledWith("currentUser123");
            const userFindResult = (User.findById as jest.Mock).mock.results[0].value;
            expect(userFindResult.select).toHaveBeenCalledWith("following");

            expect(Message.find).toHaveBeenCalledWith({receiverId: "currentUser123"});
            const messageFindResult = (Message.find as jest.Mock).mock.results[0].value;
            expect(messageFindResult.populate).toHaveBeenCalledWith("senderId", "username avatar");
            const populateResult = messageFindResult.populate.mock.results[0].value;
            expect(populateResult.select).toHaveBeenCalledWith("senderId");
        });

        it("should handle messages with null or undefined senderId", async () => {
            const mockCurrentUser = {
                _id: "currentUser123",
                following: []
            };

            const mockMessages = [
                {
                    senderId: null // Message with null senderId
                },
                {
                    senderId: {
                        _id: "sender1",
                        username: "validuser",
                        avatar: "avatar1.jpg"
                    }
                },
                {
                    senderId: undefined // Message with undefined senderId
                }
            ];

            (User.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockCurrentUser)
            });

            (Message.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockMessages)
                })
            });

            const result = await userService.getSendersForCurrentUser("currentUser123");

            expect(result).toEqual({
                senders: [
                    {
                        _id: "sender1",
                        username: "validuser",
                        avatar: "avatar1.jpg"
                    }
                ],
                count: 1
            });
        });

        it("should handle empty following array", async () => {
            const mockCurrentUser = {
                _id: "currentUser123",
                following: [] // Empty following array
            };

            const mockMessages = [
                {
                    senderId: {
                        _id: "sender1",
                        username: "user1",
                        avatar: "avatar1.jpg"
                    }
                },
                {
                    senderId: {
                        _id: "sender2",
                        username: "user2",
                        avatar: "avatar2.jpg"
                    }
                }
            ];

            (User.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockCurrentUser)
            });

            (Message.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockMessages)
                })
            });

            const result = await userService.getSendersForCurrentUser("currentUser123");

            expect(result).toEqual({
                senders: [
                    {
                        _id: "sender1",
                        username: "user1",
                        avatar: "avatar1.jpg"
                    },
                    {
                        _id: "sender2",
                        username: "user2",
                        avatar: "avatar2.jpg"
                    }
                ],
                count: 2
            });
        });
    });
});
