import request from "supertest";

import app from "../../app";
import Comment from "../../models/comment";
import {Types} from "mongoose";


const commentModule = require('../../models/comment');

// Mock the Comment model
jest.mock("../../models/comment");

describe("Comment routes", () => {
    let currentUserId: string;
    let mockJwtVerify: jest.SpyInstance;
    let mockConfigGet: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();

        // Set up current user ID for each test
        currentUserId = new Types.ObjectId().toString();

        // Mock JWT verification - returns authenticated user
        mockJwtVerify = jest.spyOn(require('jsonwebtoken'), 'verify')
            .mockReturnValue({
                id: currentUserId,
                email: "current@example.com",
                username: "currentUser"
            });

        // Mock config
        mockConfigGet = jest.spyOn(require('config'), 'get')
            .mockReturnValue('test-secret');
    });

    describe("POST /comment/create", () => {
        it("should create comment successfully", async () => {
            const postId = new Types.ObjectId().toString();

            // Mock the validation functions
            jest.spyOn(commentModule, 'validateCommentInput')
                .mockReturnValue({
                    success: true,
                    data: {post: postId, content: "This is a test comment"}
                });

            jest.spyOn(commentModule, 'validateComment')
                .mockReturnValue({success: true, data: {}});

            const mockPopulatedComment = {
                _id: new Types.ObjectId(),
                content: "This is a test comment",
                createdAt: new Date('2024-01-01T12:00:00Z'),
                user: {
                    _id: new Types.ObjectId(currentUserId),
                    username: "currentUser",
                    avatar: "https://example.com/avatar.jpg"
                },
                post: new Types.ObjectId(postId),
                likes: []
            };

            const saveMock = jest.fn().mockResolvedValue(mockPopulatedComment);
            const populateMock = jest.fn().mockResolvedValue(mockPopulatedComment);
            const mockCommentInstance = {
                _id: mockPopulatedComment._id,
                content: mockPopulatedComment.content,
                createdAt: mockPopulatedComment.createdAt,
                user: mockPopulatedComment.user,
                post: mockPopulatedComment.post,
                likes: mockPopulatedComment.likes,
                save: saveMock,
                populate: populateMock
            };

            (Comment as jest.MockedClass<typeof Comment>).mockImplementation(() => mockCommentInstance as any);

            const res = await request(app)
                .post("/comment/create")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    postId: postId,
                    content: "This is a test comment"
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Comment created successfully");
            expect(res.body.comment).toBeDefined();
            expect(res.body.comment.content).toBe("This is a test comment");

            expect(saveMock).toHaveBeenCalled();
            expect(populateMock).toHaveBeenCalledWith("user", "username avatar");
        });

        it("should return 400 for empty content", async () => {
            const postId = new Types.ObjectId().toString();

            jest.spyOn(commentModule, 'validateCommentInput')
                .mockReturnValue({
                    success: false,
                    error: {
                        errors: [{
                            path: ['content'],
                            message: 'Content is required'
                        }]
                    }
                });

            const res = await request(app)
                .post("/comment/create")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    postId: postId,
                    content: ""
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/validation/i);
        });

        it("should return 400 for content too long", async () => {
            const postId = new Types.ObjectId().toString();

            jest.spyOn(commentModule, 'validateCommentInput')
                .mockReturnValue({
                    success: false,
                    error: {
                        errors: [{
                            path: ['content'],
                            message: 'Content is too long'
                        }]
                    }
                });

            const longContent = "a".repeat(501);

            const res = await request(app)
                .post("/comment/create")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    postId: postId,
                    content: longContent
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/validation/i);
        });

        it("should return 400 for invalid post ID", async () => {
            jest.spyOn(commentModule, 'validateCommentInput')
                .mockReturnValue({
                    success: false,
                    error: {
                        errors: [{
                            path: ['post'],
                            message: 'Invalid post ID'
                        }]
                    }
                });

            const res = await request(app)
                .post("/comment/create")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    postId: "invalid-id",
                    content: "This is a valid comment"
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/validation/i);
        });

        it("should return 401 if user is not authenticated", async () => {
            const postId = new Types.ObjectId().toString();

            // Override the default mock for this specific test
            mockJwtVerify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const res = await request(app)
                .post("/comment/create")
                .send({
                    postId: postId,
                    content: "This is a test comment"
                });

            expect(res.status).toBe(401);
        });

        it("should return 400 for missing postId", async () => {
            jest.spyOn(commentModule, 'validateCommentInput')
                .mockReturnValue({
                    success: false,
                    error: {
                        errors: [{
                            path: ['post'],
                            message: 'Post ID is required'
                        }]
                    }
                });

            const res = await request(app)
                .post("/comment/create")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    content: "This is a test comment"
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/validation/i);
        });

        it("should handle database save errors", async () => {
            const postId = new Types.ObjectId().toString();

            jest.spyOn(commentModule, 'validateCommentInput')
                .mockReturnValue({success: true, data: {post: postId, content: "test"}});

            jest.spyOn(commentModule, 'validateComment')
                .mockReturnValue({success: true, data: {}});

            const saveMock = jest.fn().mockRejectedValue(new Error('Database connection error'));
            const populateMock = jest.fn();

            const mockCommentInstance = {
                save: saveMock,
                populate: populateMock
            };

            (Comment as jest.MockedClass<typeof Comment>).mockImplementation(() => mockCommentInstance as any);

            const res = await request(app)
                .post("/comment/create")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    postId: postId,
                    content: "This is a test comment"
                });

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Database connection error');
        });

        it("should return 400 for whitespace only content", async () => {
            const postId = new Types.ObjectId().toString();

            jest.spyOn(commentModule, 'validateCommentInput')
                .mockReturnValue({
                    success: false,
                    error: {
                        errors: [{
                            path: ['content'],
                            message: 'Content cannot be empty'
                        }]
                    }
                });

            const res = await request(app)
                .post("/comment/create")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    postId: postId,
                    content: "   \n\t   "
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/validation/i);
        });
    });

    describe("GET /comment/post/:id", () => {
        it("should get comments for a post successfully", async () => {
            const postId = new Types.ObjectId().toString();

            const mockComments = [
                {
                    _id: new Types.ObjectId(),
                    content: "First comment",
                    createdAt: new Date('2024-01-01T12:00:00Z'),
                    user: {
                        _id: new Types.ObjectId(currentUserId),
                        username: "currentUser",
                        avatar: "https://example.com/avatar.jpg"
                    },
                    post: new Types.ObjectId(postId),
                    likes: []
                },
                {
                    _id: new Types.ObjectId(),
                    content: "Second comment",
                    createdAt: new Date('2024-01-01T13:00:00Z'),
                    user: {
                        _id: new Types.ObjectId(),
                        username: "otherUser",
                        avatar: "https://example.com/avatar2.jpg"
                    },
                    post: new Types.ObjectId(postId),
                    likes: []
                }
            ];

            const sortMock = jest.fn().mockResolvedValue(mockComments);
            const populateMock = jest.fn().mockReturnValue({
                sort: sortMock
            });
            const findMock = jest.fn().mockReturnValue({
                populate: populateMock
            });

            (Comment.find as jest.Mock) = findMock;

            const res = await request(app)
                .get(`/comment/post/${postId}`)
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.comments).toBeDefined();
            expect(Array.isArray(res.body.comments)).toBe(true);
            expect(res.body.comments.length).toBe(2);
        });

        it("should return 401 if user is not authenticated", async () => {
            const postId = new Types.ObjectId().toString();

            // Override the default mock for this specific test
            mockJwtVerify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const res = await request(app)
                .get(`/comment/post/${postId}`);

            expect(res.status).toBe(401);
        });

        it("should return 400 for invalid post ID", async () => {
            const res = await request(app)
                .get('/comment/post/invalid-id')
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/validation|invalid/i);
        });

        it("should return empty array if no comments exist", async () => {
            const postId = new Types.ObjectId().toString();

            const sortMock = jest.fn().mockResolvedValue([]);
            const populateMock = jest.fn().mockReturnValue({
                sort: sortMock
            });
            const findMock = jest.fn().mockReturnValue({
                populate: populateMock
            });

            (Comment.find as jest.Mock) = findMock;

            const res = await request(app)
                .get(`/comment/post/${postId}`)
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.comments).toBeDefined();
            expect(Array.isArray(res.body.comments)).toBe(true);
            expect(res.body.comments.length).toBe(0);
        });

        it("should handle database errors gracefully", async () => {
            const postId = new Types.ObjectId().toString();

            const sortMock = jest.fn().mockRejectedValue(new Error('Database connection error'));
            const populateMock = jest.fn().mockReturnValue({
                sort: sortMock
            });
            const findMock = jest.fn().mockReturnValue({
                populate: populateMock
            });

            (Comment.find as jest.Mock) = findMock;

            const res = await request(app)
                .get(`/comment/post/${postId}`)
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Database connection error');
        });
    });
    describe("POST /like/:id", () => {

        it("should like comment", async () => {
            const postId = new Types.ObjectId().toString();
            const commentId = new Types.ObjectId().toString();

            const mockComment = {
                _id: new Types.ObjectId(commentId),
                content: "First comment",
                createdAt: new Date('2024-01-01T12:00:00Z'),
                user: {
                    _id: new Types.ObjectId(currentUserId),
                    username: "currentUser",
                    avatar: "https://example.com/avatar.jpg"
                },
                post: new Types.ObjectId(postId),
                likes: [],
                save: jest.fn().mockResolvedValue(true)
            };

            (Comment.findById as jest.Mock).mockResolvedValue(mockComment);

            const res = await request(app)
                .post(`/comment/like/${commentId}`)
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.message).toBeDefined();
            expect(Array.isArray(res.body.likes)).toBe(true);
            expect(res.body.likes.length).toBe(1);
            expect(res.body.message).toBe("Comment liked")
        });
        it("should return 401 if user is not authenticated", async () => {
            const postId = new Types.ObjectId().toString();

            // Override the default mock for this specific test
            mockJwtVerify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const res = await request(app)
                .get(`/comment/like/${postId}`);

            expect(res.status).toBe(401);
        });
        it("should return 400 for invalid comment ID", async () => {
            const postId = new Types.ObjectId().toString();
            const commentId = new Types.ObjectId().toString();
            const mockComment = {
                _id: new Types.ObjectId(commentId),
                content: "First comment",
                createdAt: new Date('2024-01-01T12:00:00Z'),
                user: {
                    _id: new Types.ObjectId(currentUserId),
                    username: "currentUser",
                    avatar: "https://example.com/avatar.jpg"
                },
                post: new Types.ObjectId(postId),
                likes: [],
                save: jest.fn().mockResolvedValue(true)
            };
            (Comment.findById as jest.Mock).mockResolvedValue(mockComment);

            const res = await request(app)
                .post(`/comment/like/invalid_id`)
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(400);
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toBe("Invalid comment ID");


        });
        it("should return 400 for invalid user ID", async () => {
            // Force jwt.verify to return a bad ID for this test only
            mockJwtVerify.mockReturnValue({
                id: "invalid",
                username: "currentUser",
                avatar: "https://example.com/avatar.jpg"


            })

            const commentId = new Types.ObjectId().toString();
            (Comment.findById as jest.Mock).mockResolvedValue({
                _id: commentId,
                likes: [],
                save: jest.fn().mockResolvedValue(true)
            });

            const res = await request(app)
                .post(`/comment/like/${commentId}`)
                .set("Cookie", "auth-token=mock-jwt-token");

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Invalid user ID");
        });
        it("should unlike comment", async () => {
            const postId = new Types.ObjectId().toString();
            const commentId = new Types.ObjectId().toString();

            const mockComment = {
                _id: new Types.ObjectId(commentId),
                content: "First comment",
                createdAt: new Date('2024-01-01T12:00:00Z'),
                user: {
                    _id: new Types.ObjectId(currentUserId),
                    username: "currentUser",
                    avatar: "https://example.com/avatar.jpg"
                },
                post: new Types.ObjectId(postId),
                likes: [
                    {
                        user: new Types.ObjectId(currentUserId),
                        createdAt: new Date()
                    }
                ],
                save: jest.fn().mockResolvedValue(true)
            };

            (Comment.findById as jest.Mock).mockResolvedValue(mockComment);

            const res = await request(app)
                .post(`/comment/like/${commentId}`)
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.message).toBeDefined();
            expect(Array.isArray(res.body.likes)).toBe(true);
            expect(res.body.likes.length).toBe(0); // because it should unlike
            expect(res.body.message).toBe("Comment unliked");
        });
        it("should return 404 if comment does not exist", async () => {
            const commentId = new Types.ObjectId().toString();

            // Mock Comment.findById to return null
            (Comment.findById as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .post(`/comment/like/${commentId}`)
                .set("Cookie", "auth-token=mock-jwt-token");

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Comment not found");
        });

    });
    describe("PUT update/:id", () => {
        describe("PUT update/:id", () => {
            it("should update comment successfully", async () => {
                const commentId = new Types.ObjectId().toString();
                const postId = new Types.ObjectId().toString();
                const body = { content: "Updated comment content" };

                jest.spyOn(commentModule, 'validateComment')
                    .mockReturnValue({ success: true, data: {} });

                const mockComment = {
                    _id: new Types.ObjectId(commentId),
                    content: "First comment",
                    createdAt: new Date('2024-01-01T12:00:00Z'),
                    user: {
                        _id: new Types.ObjectId(currentUserId),
                        username: "currentUser",
                        avatar: "https://example.com/avatar.jpg"
                    },
                    post: new Types.ObjectId(postId),
                    likes: [
                        {
                            user: new Types.ObjectId(currentUserId),
                            createdAt: new Date()
                        }
                    ],
                    save: jest.fn().mockResolvedValue(true)
                };

                const updatedMockComment = {
                    ...mockComment,
                    content: body.content,
                };

                (Comment.findById as jest.Mock).mockResolvedValue(mockComment);

                const mockPopulate = jest.fn().mockResolvedValue(updatedMockComment);
                (Comment.findByIdAndUpdate as jest.Mock).mockReturnValue({
                    populate: mockPopulate
                });

                const res = await request(app)
                    .patch(`/comment/update/${commentId}`)
                    .set("Cookie", "auth-token=mock-jwt-token")
                    .send(body);

                expect(res.status).toBe(200);
                expect(res.body.message).toBe("Comment updated successfully");
                expect(res.body.comment.content).toBe(body.content);
                expect(mockPopulate).toHaveBeenCalledWith("user", "username avatar");
            });

            it("should return 400 for invalid comment ID", async () => {
                const invalidCommentId = "invalid-id";
                const body = { content: "Updated comment content" };

                const res = await request(app)
                    .patch(`/comment/update/${invalidCommentId}`)
                    .set("Cookie", "auth-token=mock-jwt-token")
                    .send(body);

                expect(res.status).toBe(400);
                expect(res.body.message).toBe("Invalid comment ID");
                expect(res.body.errors).toEqual({ id: 'Invalid comment ID' });
            });

            it("should return 400 when content is missing", async () => {
                const commentId = new Types.ObjectId().toString();
                const body = {}; // No content

                const res = await request(app)
                    .patch(`/comment/update/${commentId}`)
                    .set("Cookie", "auth-token=mock-jwt-token")
                    .send(body);

                expect(res.status).toBe(400);
                expect(res.body.message).toBe("Content is required");
            });

            it("should return 400 when content is empty string", async () => {
                const commentId = new Types.ObjectId().toString();
                const body = { content: "" };

                const res = await request(app)
                    .patch(`/comment/update/${commentId}`)
                    .set("Cookie", "auth-token=mock-jwt-token")
                    .send(body);

                expect(res.status).toBe(400);
                expect(res.body.message).toBe("Content is required");
            });

            it("should return 404 if comment does not exist", async () => {
                const commentId = new Types.ObjectId().toString();
                const body = { content: "Updated comment content" };

                (Comment.findById as jest.Mock).mockResolvedValue(null);

                const res = await request(app)
                    .patch(`/comment/update/${commentId}`)
                    .set("Cookie", "auth-token=mock-jwt-token")
                    .send(body);

                expect(res.status).toBe(404);
                expect(res.body.message).toBe("Comment not found");
            });

            it("should return 400 if validation fails", async () => {
                const commentId = new Types.ObjectId().toString();
                const postId = new Types.ObjectId().toString();
                const body = { content: "Updated comment content" };

                const mockComment = {
                    _id: new Types.ObjectId(commentId),
                    content: "First comment",
                    createdAt: new Date('2024-01-01T12:00:00Z'),
                    user: new Types.ObjectId(currentUserId),
                    post: new Types.ObjectId(postId),
                    likes: []
                };

                (Comment.findById as jest.Mock).mockResolvedValue(mockComment);

                jest.spyOn(commentModule, 'validateComment')
                    .mockReturnValue({
                        success: false,
                        error: {
                            errors: {
                                content: "Content must be at least 10 characters"
                            }
                        }
                    });

                const res = await request(app)
                    .patch(`/comment/update/${commentId}`)
                    .set("Cookie", "auth-token=mock-jwt-token")
                    .send(body);

                expect(res.status).toBe(400);
                expect(res.body.message).toBe("Validation failed");
                expect(res.body.errors).toEqual({
                    content: "Content must be at least 10 characters"
                });
            });

            it("should return 500 if database update fails", async () => {
                const commentId = new Types.ObjectId().toString();
                const postId = new Types.ObjectId().toString();
                const body = { content: "Updated comment content" };

                jest.spyOn(commentModule, 'validateComment')
                    .mockReturnValue({ success: true, data: {} });

                const mockComment = {
                    _id: new Types.ObjectId(commentId),
                    content: "First comment",
                    createdAt: new Date('2024-01-01T12:00:00Z'),
                    user: new Types.ObjectId(currentUserId),
                    post: new Types.ObjectId(postId),
                    likes: []
                };

                (Comment.findById as jest.Mock).mockResolvedValue(mockComment);

                const mockPopulate = jest.fn().mockRejectedValue(new Error("Database error"));
                (Comment.findByIdAndUpdate as jest.Mock).mockReturnValue({
                    populate: mockPopulate
                });

                const res = await request(app)
                    .patch(`/comment/update/${commentId}`)
                    .set("Cookie", "auth-token=mock-jwt-token")
                    .send(body);

                expect(res.status).toBe(500);
                expect(res.body.message).toBe("Database error");
            });

            it("should return 401 if user is not authenticated", async () => {
                const commentId = new Types.ObjectId().toString();
                const body = { content: "Updated comment content" };

                const res = await request(app)
                    .patch(`/comment/update/${commentId}`)
                    // No auth token provided
                    .send(body);

                expect(res.status).toBe(401);
            });

            it("should preserve existing comment data (user, post, createdAt, likes)", async () => {
                const commentId = new Types.ObjectId().toString();
                const postId = new Types.ObjectId().toString();
                const userId = new Types.ObjectId(currentUserId);
                const createdAt = new Date('2024-01-01T12:00:00Z');
                const body = { content: "Updated comment content" };

                jest.spyOn(commentModule, 'validateComment')
                    .mockReturnValue({ success: true, data: {} });

                const mockComment = {
                    _id: new Types.ObjectId(commentId),
                    content: "First comment",
                    createdAt: createdAt,
                    user: userId,
                    post: new Types.ObjectId(postId),
                    likes: [
                        {
                            user: userId,
                            createdAt: new Date()
                        }
                    ]
                };

                (Comment.findById as jest.Mock).mockResolvedValue(mockComment);

                const mockPopulate = jest.fn().mockResolvedValue({
                    ...mockComment,
                    content: body.content,
                    user: {
                        _id: userId,
                        username: "currentUser",
                        avatar: "https://example.com/avatar.jpg"
                    }
                });
                (Comment.findByIdAndUpdate as jest.Mock).mockReturnValue({
                    populate: mockPopulate
                });

                const res = await request(app)
                    .patch(`/comment/update/${commentId}`)
                    .set("Cookie", "auth-token=mock-jwt-token")
                    .send(body);

                expect(res.status).toBe(200);
                expect(res.body.comment.content).toBe(body.content);

                // Verify findByIdAndUpdate was called with correct data
                expect(Comment.findByIdAndUpdate).toHaveBeenCalledWith(
                    commentId,
                    {
                        $set: {
                            content: body.content,
                            user: mockComment.user,
                            post: mockComment.post,
                            createdAt: mockComment.createdAt,
                            likes: mockComment.likes
                        }
                    },
                    { new: true }
                );
            });
        });

    });
    describe("DELETE /comment/delete/:id", () => {
        it("should delete a comment successfully", async () => {
            const commentId = new Types.ObjectId().toString();
            const mockComment = {
                _id: commentId,
                content: "Test comment",
            };

            // Mock: findById returns the comment
            (Comment.findById as jest.Mock).mockResolvedValue(mockComment);
            // Mock: deleteOne resolves successfully
            (Comment.deleteOne as jest.Mock).mockResolvedValue({deletedCount: 1});

            const res = await request(app)
                .delete(`/comment/delete/${commentId}`)
                .set("Cookie", "auth-token=mock-jwt-token");

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Comment deleted successfully");
        });

        it("should return 400 for invalid comment ID", async () => {
            const res = await request(app)
                .delete(`/comment/delete/invalid_id`)
                .set("Cookie", "auth-token=mock-jwt-token");

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Invalid comment ID");
            expect(res.body.errors).toEqual({id: "Invalid comment ID"});
        });

        it("should return 404 if comment does not exist", async () => {
            const commentId = new Types.ObjectId().toString();

            // Mock: findById returns null
            (Comment.findById as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .delete(`/comment/delete/${commentId}`)
                .set("Cookie", "auth-token=mock-jwt-token");

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Comment not found");
        });

        it("should return 500 if database delete fails", async () => {
            const commentId = new Types.ObjectId().toString();
            const mockComment = {
                _id: commentId,
                content: "Test comment",
            };

            // Mock: findById returns a valid comment
            (Comment.findById as jest.Mock).mockResolvedValue(mockComment);
            // Mock: deleteOne throws error
            (Comment.deleteOne as jest.Mock).mockRejectedValue(new Error("DB error"));

            const res = await request(app)
                .delete(`/comment/delete/${commentId}`)
                .set("Cookie", "auth-token=mock-jwt-token");

            expect(res.status).toBe(500);
            expect(res.body.message).toBe("DB error");
        });
    });


});