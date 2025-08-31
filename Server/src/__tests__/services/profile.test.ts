import * as profileService from "../../services/profileService";
import User from "../../models/user";
import mongoose from "mongoose";
import {profileUpdateSchema} from "../../services/profileService";
import {z} from "zod";

jest.mock("../../models/user");

jest.mock("../../services/profileService", () => ({
    ...jest.requireActual("../../services/profileService"),
    profileUpdateSchema: {
        safeParse: jest.fn()
    }
}));

describe("Profile Services", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockUser = {
        _id: "64c9f5a7b9e7c4e8d1234567",
        username: "abdelrahman",
        email: "abdo@example.com",
        avatar: "https://example.com/avatar.png",
        bio: "Original bio",
        posts: [] as mongoose.Types.ObjectId[],
        followers: [] as mongoose.Types.ObjectId[],
        save: jest.fn().mockResolvedValue(true)
    };

    const mockCurrentUser = {
        _id: "64c9f5a7b9e7c4e8d7654321",
        username: "current",
        following: [] as mongoose.Types.ObjectId[],
        save: jest.fn().mockResolvedValue(true),
    };

    describe("getProfile", () => {
        it("should return 401 if userId not found", async () => {
            await expect(profileService.getProfile("")).rejects.toEqual({
                status: 401,
                message: "Unauthorized",
            });
        });

        it("should return 404 if user not found", async () => {
            const execMock = jest.fn().mockResolvedValue(null);
            const populateMock = jest.fn().mockReturnValue({exec: execMock});
            const selectMock = jest.fn().mockReturnValue({populate: populateMock});

            (User.findById as jest.Mock).mockReturnValue({select: selectMock});

            await expect(profileService.getProfile(mockUser._id)).rejects.toEqual({
                status: 404,
                message: "User not found",
            });

            expect(User.findById).toHaveBeenCalledWith(mockUser._id);
        });

        it("should return user profile successfully", async () => {
            const execMock = jest.fn().mockReturnValue(mockUser);
            const populateMock = jest.fn().mockReturnValue({exec: execMock});
            const selectMock = jest.fn().mockReturnValue({populate: populateMock});
            (User.findById as jest.Mock).mockReturnValue({select: selectMock});
            await expect(profileService.getProfile(mockUser._id)).resolves.toEqual(mockUser);
            expect(User.findById).toHaveBeenCalledWith(mockUser._id);
        });
    });

    describe("getProfileById", () => {
        it("should return 401 if requesterId not provided", async () => {
            await expect(
                profileService.getProfileById(mockUser._id, "")
            ).rejects.toEqual({
                status: 401,
                message: "Unauthorized: User not authenticated",
            });
        });

        it("should return 404 if user not found", async () => {
            const execMock = jest.fn().mockResolvedValue(null);
            const populateMock = jest.fn().mockReturnValue({exec: execMock});
            const selectMock = jest.fn().mockReturnValue({populate: populateMock});

            (User.findById as jest.Mock).mockReturnValue({select: selectMock});

            await expect(
                profileService.getProfileById(mockUser._id, "requester123")
            ).rejects.toEqual({
                status: 404,
                message: "User not found",
            });

            expect(User.findById).toHaveBeenCalledWith(mockUser._id);
        });

        it("should return user profile successfully", async () => {
            const execMock = jest.fn().mockResolvedValue(mockUser);
            const populateMock = jest.fn().mockReturnValue({exec: execMock});
            const selectMock = jest.fn().mockReturnValue({populate: populateMock});

            (User.findById as jest.Mock).mockReturnValue({select: selectMock});

            await expect(
                profileService.getProfileById(mockUser._id, "requester123")
            ).resolves.toEqual(mockUser);

            expect(User.findById).toHaveBeenCalledWith(mockUser._id);
        });
    });

    describe("followUser", () => {
        it("should return 404 if target user not found", async () => {
            const execMock = jest.fn().mockResolvedValue(null);
            const populateMock = jest.fn().mockReturnValue({exec: execMock});
            const selectMock = jest.fn().mockReturnValue({populate: populateMock});

            (User.findById as jest.Mock).mockReturnValue({select: selectMock});

            await expect(
                profileService.followUser(mockUser._id, mockCurrentUser._id)
            ).rejects.toEqual({status: 404, message: "User not found"});
        });

        it("should return 404 if current user not found", async () => {
            // First call = targetUser
            const execMock = jest.fn().mockResolvedValue(mockUser);
            const populateMock = jest.fn().mockReturnValue({exec: execMock});
            const selectMock = jest.fn().mockReturnValue({populate: populateMock});

            (User.findById as jest.Mock)
                .mockReturnValueOnce({select: selectMock})
                .mockResolvedValueOnce(null);

            await expect(
                profileService.followUser(mockUser._id, mockCurrentUser._id)
            ).rejects.toEqual({status: 404, message: "Authenticated user not found"});
        });

        it("should follow a user successfully", async () => {
            // Reset arrays
            mockUser.followers = [];
            mockCurrentUser.following = [];

            const execMock = jest.fn().mockResolvedValue(mockUser);
            const populateMock = jest.fn().mockReturnValue({exec: execMock});
            const selectMock = jest.fn().mockReturnValue({populate: populateMock});

            (User.findById as jest.Mock)
                .mockReturnValueOnce({select: selectMock}) // targetUser
                .mockResolvedValueOnce(mockCurrentUser); // currentUser

            const result = await profileService.followUser(
                mockUser._id,
                mockCurrentUser._id
            );
            expect(result.alreadyFollowing).toBe(false);
            expect(mockUser.followers).toContainEqual(
                new mongoose.Types.ObjectId(mockCurrentUser._id)
            );
            expect(mockCurrentUser.following).toContainEqual(
                new mongoose.Types.ObjectId(mockUser._id)
            );
            expect(mockUser.save).toHaveBeenCalled();
            expect(mockCurrentUser.save).toHaveBeenCalled();
        });

        it("should unfollow a user successfully if already following", async () => {
            // Pretend already following
            const currentUserObjId = new mongoose.Types.ObjectId(mockCurrentUser._id);
            const targetUserObjId = new mongoose.Types.ObjectId(mockUser._id);

            mockUser.followers = [currentUserObjId];
            mockCurrentUser.following = [targetUserObjId];

            const execMock = jest.fn().mockResolvedValue(mockUser);
            const populateMock = jest.fn().mockReturnValue({exec: execMock});
            const selectMock = jest.fn().mockReturnValue({populate: populateMock});

            (User.findById as jest.Mock)
                .mockReturnValueOnce({select: selectMock}) // targetUser
                .mockResolvedValueOnce(mockCurrentUser); // currentUser

            const result = await profileService.followUser(
                mockUser._id,
                mockCurrentUser._id
            );

            expect(result.alreadyFollowing).toBe(true);
            expect(mockUser.followers).not.toContainEqual(currentUserObjId);
            expect(mockCurrentUser.following).not.toContainEqual(targetUserObjId);
            expect(mockUser.save).toHaveBeenCalled();
            expect(mockCurrentUser.save).toHaveBeenCalled();
        });
    });

    describe("updateProfile", () => {
        const mockSafeParse = profileUpdateSchema.safeParse as jest.MockedFunction<typeof profileUpdateSchema.safeParse>;

        beforeEach(() => {
            // Mock successful validation by default
            mockSafeParse.mockReturnValue({
                success: true,
                data: { username: "newUsername", bio: "Updated bio", avatar: "https://example.com/new-avatar.png" }
            });
        });

        it("should return 401 if user not found", async () => {
            await expect(profileService.updateProfile("", "", {})).rejects.toEqual({
                status: 401,
                message: "Unauthorized: User not authenticated"
            });
        });

        it("should return 403 if user tries to update other user profile", async () => {
            await expect(profileService.updateProfile(mockUser._id, mockCurrentUser._id, {})).rejects.toEqual({
                status: 403,
                message: "Forbidden: You cannot edit another user's profile"
            });
        });

        it("should return 400 if validation fails", async () => {
            mockSafeParse.mockReturnValue({
                success: false,
                error: new z.ZodError([
                    {
                        code: z.ZodIssueCode.custom,
                        path: ["username"],
                        message: "Username is invalid"
                    }
                ])
            });

            await expect(
                profileService.updateProfile(mockCurrentUser._id, mockCurrentUser._id, { username: "a" })
            ).rejects.toEqual({
                status: 400,
                message: "Invalid input",
                errors: expect.any(Array)
            });
        });

        it("should return 404 if user does not exist", async () => {
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await expect(
                profileService.updateProfile(mockCurrentUser._id, mockCurrentUser._id, { username: "newUsername" })
            ).rejects.toEqual({
                status: 404,
                message: "User not found"
            });
        });

        it("should update profile successfully", async () => {
            const updateBody = { username: "newUsername", bio: "Updated bio", avatar: "https://example.com/new-avatar.png" };

            // Mock the validation to return the update data
            mockSafeParse.mockReturnValue({
                success: true,
                data: updateBody
            });

            const updatedUser = {
                ...mockUser,
                username: "newUsername",
                bio: "Updated bio",
                avatar: "https://example.com/new-avatar.png",
                populate: jest.fn().mockResolvedValue({
                    ...mockUser,
                    username: "newUsername",
                    bio: "Updated bio",
                    avatar: "https://example.com/new-avatar.png",
                })
            };

            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

            const result = await profileService.updateProfile(
                mockUser._id,
                mockUser._id,
                updateBody
            );

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                mockUser._id,
                expect.objectContaining({
                    username: "newUsername",
                    bio: "Updated bio",
                    avatar: "https://example.com/new-avatar.png",
                    updatedAt: expect.any(Date),
                }),
                { new: true }
            );

            expect(updatedUser.populate).toHaveBeenCalledWith("posts");
            expect(result.username).toBe("newUsername");
            expect(result.bio).toBe("Updated bio");
            expect(result.avatar).toBe("https://example.com/new-avatar.png");
        });
    });
});