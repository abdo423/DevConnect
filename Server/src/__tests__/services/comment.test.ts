import * as commentService from "../../services/commentService";
import Comment, { validateComment, validateCommentInput } from "../../models/comment";
import mongoose, { Types } from "mongoose";

jest.mock("../../models/comment");

// Mock only the isValid method without breaking the ObjectId constructor
Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

describe("Comment Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const validUserId = "64c9f5a7b9e7c4e8d1234567";
    const validPostId = "64c9f5a7b9e7c4e8d1234568";
    const validCommentId = "64c9f5a7b9e7c4e8d7654321";
    const validContent = "This is a test comment";

    const mockUser = {
        _id: validUserId,
        username: "testuser",
        avatar: "http://example.com/avatar.jpg"
    };

    const mockPopulatedComment = {
        _id: validCommentId,
        user: mockUser,
        post: validPostId,
        content: validContent,
        likes: [],
        createdAt: new Date()
    };

    const mockComment = {
        _id: validCommentId,
        user: validUserId,
        post: validPostId,
        content: validContent,
        likes: [],
        createdAt: new Date(),
        save: jest.fn(),
        populate: jest.fn()
    };

    describe("createComment", () => {
        beforeEach(() => {
            jest.clearAllMocks();

            (validateCommentInput as jest.Mock).mockReturnValue({
                success: true,
                data: { post: validPostId, content: validContent }
            });

            (validateComment as jest.Mock).mockReturnValue({
                success: true,
                data: mockComment  // This should be the unpopulated comment
            });

            (Comment as unknown as jest.Mock).mockImplementation(() => mockComment);

            mockComment.save = jest.fn().mockResolvedValue(mockComment);
            mockComment.populate = jest.fn().mockResolvedValue(mockPopulatedComment);

            (Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
        });

        it("should create comment successfully", async () => {
            const result = await commentService.createComment(validUserId, validPostId, validContent);

            expect(validateCommentInput).toHaveBeenCalledWith({
                post: validPostId,
                content: validContent
            });

            expect(Types.ObjectId.isValid).toHaveBeenCalledWith(validUserId);

            expect(Comment).toHaveBeenCalledWith({
                user: new Types.ObjectId(validUserId),
                post: new Types.ObjectId(validPostId),
                content: validContent,
                likes: [],
                createdAt: expect.any(Date)
            });

            expect(mockComment.save).toHaveBeenCalled();
            expect(mockComment.populate).toHaveBeenCalledWith('user', 'username avatar');

            expect(result.user).toEqual(mockUser);
            expect(result.content).toBe(validContent);
        });

        it("should throw 400 if comment input validation fails", async () => {
            (validateCommentInput as jest.Mock).mockReturnValue({
                success: false,
                error: {
                    errors: [
                        { path: ["content"], message: "Content is required" },
                        { path: ["post"], message: "Invalid post ID" }
                    ]
                }
            });

            await expect(
                commentService.createComment(validUserId, "", "")
            ).rejects.toEqual({
                status: 400,
                message: "Validation failed",
                errors: [
                    { field: "content", message: "Content is required" },
                    { field: "post", message: "Invalid post ID" }
                ]
            });
        });

        it("should throw 400 if user ID is invalid", async () => {
            (Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await expect(
                commentService.createComment("invalid-user-id", validPostId, validContent)
            ).rejects.toEqual({
                status: 400,
                message: "Invalid user ID",
                errors: [{ path: ["user"], message: "Invalid user ID" }]
            });
        });

        it("should throw 400 if comment object validation fails", async () => {
            (validateComment as jest.Mock).mockReturnValue({
                success: false,
                error: { errors: ["Invalid comment data"] }
            });

            await expect(
                commentService.createComment(validUserId, validPostId, validContent)
            ).rejects.toEqual({
                status: 400,
                message: "Validation failed",
                errors: ["Invalid comment data"]
            });
        });
    });

    describe("deleteComment", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            (Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
        });

        it("should delete comment successfully", async () => {
            (Comment.findById as jest.Mock).mockResolvedValue(mockComment);
            (Comment.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            const result = await commentService.deleteComment(validCommentId);

            expect(Types.ObjectId.isValid).toHaveBeenCalledWith(validCommentId);
            expect(Comment.findById).toHaveBeenCalledWith(validCommentId);
            expect(Comment.deleteOne).toHaveBeenCalledWith({ _id: validCommentId });
            expect(result).toBe(true);
        });

        it("should throw 400 if comment ID is invalid", async () => {
            (Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await expect(
                commentService.deleteComment("invalid-id")
            ).rejects.toEqual({
                status: 400,
                message: "Invalid comment ID",
                errors: { id: 'Invalid comment ID' }
            });

            expect(Comment.findById).not.toHaveBeenCalled();
        });

        it("should throw 404 if comment not found", async () => {
            (Comment.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                commentService.deleteComment(validCommentId)
            ).rejects.toEqual({
                status: 404,
                message: "Comment not found"
            });

            expect(Comment.deleteOne).not.toHaveBeenCalled();
        });
    });

    describe("updateComment", () => {
        const updateBody = { content: "Updated content" };

        beforeEach(() => {
            jest.clearAllMocks();
            (Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
            (validateComment as jest.Mock).mockReturnValue({ success: true });
        });

        it("should update comment successfully", async () => {
            (Comment.findById as jest.Mock).mockResolvedValue(mockComment);
            (Comment.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockPopulatedComment)
            });

            const result = await commentService.updateComment(validCommentId, updateBody);

            expect(Types.ObjectId.isValid).toHaveBeenCalledWith(validCommentId);
            expect(Comment.findById).toHaveBeenCalledWith(validCommentId);
            expect(Comment.findByIdAndUpdate).toHaveBeenCalledWith(
                validCommentId,
                { $set: expect.objectContaining(updateBody) },
                { new: true }
            );
            expect(result).toEqual(expect.objectContaining(updateBody));
        });

        it("should throw 400 if comment ID is invalid", async () => {
            (Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await expect(
                commentService.updateComment("invalid-id", updateBody)
            ).rejects.toEqual({
                status: 400,
                message: "Invalid comment ID",
                errors: { id: 'Invalid comment ID' }
            });
        });

        it("should throw 400 if content is missing", async () => {
            await expect(
                commentService.updateComment(validCommentId, { content: undefined } as any)
            ).rejects.toEqual({
                status: 400,
                message: "Content is required"
            });
        });

        it("should throw 404 if comment not found", async () => {
            (Comment.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                commentService.updateComment(validCommentId, updateBody)
            ).rejects.toEqual({
                status: 404,
                message: "Comment not found"
            });
        });

        it("should throw 400 if comment validation fails", async () => {
            (Comment.findById as jest.Mock).mockResolvedValue(mockComment);
            (validateComment as jest.Mock).mockReturnValue({
                success: false,
                error: { errors: ["Validation error"] }
            });

            await expect(
                commentService.updateComment(validCommentId, updateBody)
            ).rejects.toEqual({
                status: 400,
                message: "Validation failed",
                errors: ["Validation error"]
            });
        });
    });

    describe("getCommentsByPost", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            (Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
        });

        it("should get comments by post successfully", async () => {
            const mockComments = [mockPopulatedComment];
            const mockQuery = {
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(mockComments)
                })
            };
            (Comment.find as jest.Mock).mockReturnValue(mockQuery);

            const result = await commentService.getCommentsByPost(validPostId);

            expect(Types.ObjectId.isValid).toHaveBeenCalledWith(validPostId);
            expect(Comment.find).toHaveBeenCalledWith({ post: validPostId });
            expect(mockQuery.populate).toHaveBeenCalledWith("user", "username avatar");
            expect(result).toEqual(mockComments);
        });

        it("should throw 400 if post ID is invalid", async () => {
            (Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await expect(
                commentService.getCommentsByPost("invalid-id")
            ).rejects.toEqual({
                status: 400,
                message: "Invalid post ID"
            });

            expect(Comment.find).not.toHaveBeenCalled();
        });
    });

    describe("likeComment", () => {
        const mockCommentWithLikes = {
            ...mockComment,
            likes: [
                { user: new Types.ObjectId("64c9f5a7b9e7c4e8d1234569"), createdAt: new Date() }
            ],
            save: jest.fn().mockResolvedValue(true)
        };

        beforeEach(() => {
            jest.clearAllMocks();
            (Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
        });

        it("should add like when user hasn't liked the comment", async () => {
            (Comment.findById as jest.Mock).mockResolvedValue(mockComment);

            const result = await commentService.likeComment(validCommentId, validUserId);

            expect(Types.ObjectId.isValid).toHaveBeenCalledWith(validCommentId);
            expect(Types.ObjectId.isValid).toHaveBeenCalledWith(validUserId);
            expect(Comment.findById).toHaveBeenCalledWith(validCommentId);
            expect(mockComment.save).toHaveBeenCalled();
            expect(result.alreadyLiked).toBe(false);
            expect(result.likes).toEqual([validUserId]);
        });

        it("should remove like when user has already liked the comment", async () => {
            const commentWithUserLike = {
                ...mockComment,
                likes: [
                    { user: new Types.ObjectId(validUserId), createdAt: new Date() },
                    { user: new Types.ObjectId("64c9f5a7b9e7c4e8d1234569"), createdAt: new Date() }
                ],
                save: jest.fn().mockResolvedValue(true)
            };

            (Comment.findById as jest.Mock).mockResolvedValue(commentWithUserLike);

            const result = await commentService.likeComment(validCommentId, validUserId);

            expect(result.alreadyLiked).toBe(true);
            expect(result.likes).toEqual(["64c9f5a7b9e7c4e8d1234569"]);
        });

        it("should throw 400 if comment ID is invalid", async () => {
            (Types.ObjectId.isValid as jest.Mock)
                .mockReturnValueOnce(false)
                .mockReturnValue(true);

            await expect(
                commentService.likeComment("invalid-id", validUserId)
            ).rejects.toEqual({
                status: 400,
                message: "Invalid comment ID",
                errors: { id: "Invalid comment ID" }
            });
        });

        it("should throw 400 if user ID is invalid", async () => {
            (Types.ObjectId.isValid as jest.Mock)
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false);

            await expect(
                commentService.likeComment(validCommentId, "invalid-id")
            ).rejects.toEqual({
                status: 400,
                message: "Invalid user ID",
                errors: { id: "Invalid user ID" }
            });
        });

        it("should throw 404 if comment not found", async () => {
            (Comment.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                commentService.likeComment(validCommentId, validUserId)
            ).rejects.toEqual({
                status: 404,
                message: "Comment not found"
            });
        });

        it("should handle multiple likes correctly", async () => {
            (Comment.findById as jest.Mock).mockResolvedValue(mockCommentWithLikes);

            const result = await commentService.likeComment(validCommentId, validUserId);

            expect(result.alreadyLiked).toBe(false);
            expect(result.likes).toEqual(["64c9f5a7b9e7c4e8d1234569", validUserId]);
        });

        it("should handle ObjectId toString comparison correctly", async () => {
            const commentWithStringLike = {
                ...mockComment,
                likes: [
                    {
                        user: { toString: () => validUserId },
                        createdAt: new Date()
                    }
                ],
                save: jest.fn().mockResolvedValue(true)
            };

            (Comment.findById as jest.Mock).mockResolvedValue(commentWithStringLike);

            const result = await commentService.likeComment(validCommentId, validUserId);

            expect(result.alreadyLiked).toBe(true);
            expect(result.likes).toEqual([]);
        });
    });

    describe("Edge Cases and Error Handling", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            (Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
        });

        it("should handle database connection errors in createComment", async () => {
            (validateCommentInput as jest.Mock).mockReturnValue({ success: true });
            (validateComment as jest.Mock).mockReturnValue({ success: true });
            (Comment as unknown as jest.Mock).mockImplementation(() => mockComment);

            mockComment.save = jest.fn().mockRejectedValue(new Error("Database connection failed"));

            await expect(
                commentService.createComment(validUserId, validPostId, validContent)
            ).rejects.toThrow("Database connection failed");
        });

        it("should handle populate errors in createComment", async () => {
            (validateCommentInput as jest.Mock).mockReturnValue({ success: true });
            (validateComment as jest.Mock).mockReturnValue({ success: true });
            (Comment as unknown as jest.Mock).mockImplementation(() => mockComment);

            mockComment.save = jest.fn().mockResolvedValue(mockComment);
            mockComment.populate = jest.fn().mockRejectedValue(new Error("Populate failed"));

            await expect(
                commentService.createComment(validUserId, validPostId, validContent)
            ).rejects.toThrow("Populate failed");
        });

        it("should handle database errors in deleteComment", async () => {
            (Comment.findById as jest.Mock).mockResolvedValue(mockComment);
            (Comment.deleteOne as jest.Mock).mockRejectedValue(new Error("Delete failed"));

            await expect(
                commentService.deleteComment(validCommentId)
            ).rejects.toThrow("Delete failed");
        });

        it("should handle empty likes array in likeComment", async () => {
            const commentWithNoLikes = { ...mockComment, likes: [] };
            (Comment.findById as jest.Mock).mockResolvedValue(commentWithNoLikes);

            const result = await commentService.likeComment(validCommentId, validUserId);

            expect(result.alreadyLiked).toBe(false);
            expect(result.likes).toEqual([validUserId]);
        });
    });
});