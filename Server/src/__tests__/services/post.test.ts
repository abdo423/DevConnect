import * as postService from "../../services/postService";
import Post, {validatePost, validateUpdatePost} from "../../models/post"; // <- adjust if needed
import User from "../../models/user";
import Comment from "../../models/comment";
jest.mock("../../models/post");
jest.mock("../../models/user");
jest.mock("../../models/comment");

describe("Post Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const mockComments = [
        {
            _id: "c1",
            content: "First comment",
            user: {_id: "u1", name: "User1", email: "user1@example.com"},
            createdAt: new Date("2024-01-01"),
        },
        {
            _id: "c2",
            content: "Second comment",
            user: {_id: "u2", name: "User2", email: "user2@example.com"},
            createdAt: new Date("2024-01-02"),
        },
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockExistingPost = {
        _id: "507f1f77bcf86cd799439011",
        title: "Original Title",
        content: "Original content",
        image: "original-image.jpg",
        author_id: "507f1f77bcf86cd799439012",
        likes: 10,
        comments: [],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        save: jest.fn().mockResolvedValue(true),
    };

    const mockUpdatedPost = {
        ...mockExistingPost,
        title: "Updated Title",
        content: "Updated content",
        updatedAt: new Date(),
        author_id: {
            _id: "507f1f77bcf86cd799439012",
            username: "testuser",
            email: "test@example.com",
            avatar: "avatar.jpg"
        }
    };
    const mockPost = {

        title: "Test Post",
        content: "This is a test post content",
        image: "http://example.com/test.jpg",
        likes: [],
        comments: [],
    };
    const validUserId = "64c9f5a7b9e7c4e8d1234567";

    const mockCreatedPost = {
        _id: "64c9f5a7b9e7c4e8d7654321",
        id: "64c9f5a7b9e7c4e8d7654321", // Add id property for Mongoose compatibility
        ...mockPost,
        author_id: validUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
    };

    const mockUser = {
        _id: validUserId,
        username: "testuser",
        email: "test@example.com",
        avatar: "http://example.com/avatar.jpg",
        posts: []
    };

    const mockPopulatedPost = {
        ...mockCreatedPost,
        author_id: {
            _id: validUserId,
            username: "testuser",
            email: "test@example.com",
            avatar: "http://example.com/avatar.jpg"
        },
        comments: []
    };

    describe("createPost", () => {
        it("should return 401 if userId is missing", async () => {
            await expect(postService.createPost("", mockPost)).rejects.toEqual({
                status: 401,
                message: "User not authenticated",
            });
        });

        it("should throw 400 if validation fails", async () => {
            const invalidPost = {title: "", content: ""};

            // 🔹 Force validatePost to return a Zod failure (typed properly)
            jest
                .spyOn(require("../../models/post"), "validatePost")
                .mockReturnValue({
                    success: false,
                    error: {
                        errors: ["Title is required", "Content is required"],
                    },
                });

            await expect(
                postService.createPost(validUserId, invalidPost)
            ).rejects.toMatchObject({
                status: 400,
                message: ["Title is required", "Content is required"],
            });
        });

        it("should throw 404 if user doesn't exist", async () => {
            // Mock successful validation
            jest
                .spyOn(require("../../models/post"), "validatePost")
                .mockReturnValue({
                    success: true,
                    data: mockPost,
                });

            // Mock Post constructor and save
            (Post as unknown as jest.Mock).mockImplementation(() => mockCreatedPost);

            // Mock Post.findById with populate chain
            const secondPopulateMock = jest.fn().mockResolvedValue(mockPopulatedPost);
            const firstPopulateMock = jest.fn().mockReturnValue({
                populate: secondPopulateMock
            });
            (Post.findById as unknown as jest.Mock).mockReturnValue({
                populate: firstPopulateMock
            });

            // Mock User.findById to return null (user not found)
            (User.findById as unknown as jest.Mock).mockResolvedValue(null);

            await expect(
                postService.createPost(validUserId, mockPost)
            ).rejects.toEqual({
                status: 404,
                success: false,
                message: "account doesn't exist"
            });

            // Verify that post was created and saved before user check
            expect(Post).toHaveBeenCalled();
            expect(mockCreatedPost.save).toHaveBeenCalled();
            expect(User.findById).toHaveBeenCalledWith(validUserId);
        });

        it("should handle post save failure", async () => {
            // Mock successful validation
            jest
                .spyOn(require("../../models/post"), "validatePost")
                .mockReturnValue({
                    success: true,
                    data: mockPost,
                });

            // Mock Post constructor with failing save
            const mockFailingPost = {
                ...mockCreatedPost,
                save: jest.fn().mockRejectedValue(new Error("Database error"))
            };
            (Post as unknown as jest.Mock).mockImplementation(() => mockFailingPost);

            await expect(
                postService.createPost(validUserId, mockPost)
            ).rejects.toThrow("Database error");

            expect(mockFailingPost.save).toHaveBeenCalled();
        });

        it("should handle Post.findById failure during population", async () => {
            // Mock successful validation
            jest
                .spyOn(require("../../models/post"), "validatePost")
                .mockReturnValue({
                    success: true,
                    data: mockPost,
                });

            // Mock Post constructor and save
            (Post as unknown as jest.Mock).mockImplementation(() => mockCreatedPost);

            // Mock Post.findById to throw error during population
            (Post.findById as unknown as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockRejectedValue(new Error("Population error"))
                })
            });

            await expect(
                postService.createPost(validUserId, mockPost)
            ).rejects.toThrow("Population error");

            expect(mockCreatedPost.save).toHaveBeenCalled();
        });

        it("should handle User.findByIdAndUpdate failure", async () => {
            // Mock successful validation
            jest
                .spyOn(require("../../models/post"), "validatePost")
                .mockReturnValue({
                    success: true,
                    data: mockPost,
                });

            // Mock Post constructor and save
            (Post as unknown as jest.Mock).mockImplementation(() => mockCreatedPost);

            // Mock Post.findById with populate chain
            const secondPopulateMock = jest.fn().mockResolvedValue(mockPopulatedPost);
            const firstPopulateMock = jest.fn().mockReturnValue({
                populate: secondPopulateMock
            });
            (Post.findById as unknown as jest.Mock).mockReturnValue({
                populate: firstPopulateMock
            });

            // Mock User.findById to return user
            (User.findById as unknown as jest.Mock).mockResolvedValue(mockUser);

            // Mock User.findByIdAndUpdate to fail
            (User.findByIdAndUpdate as unknown as jest.Mock).mockRejectedValue(new Error("Update failed"));

            await expect(
                postService.createPost(validUserId, mockPost)
            ).rejects.toThrow("Update failed");

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                validUserId,
                {$push: {posts: mockCreatedPost.id}}, // Use .id instead of ._id
                {new: true}
            );
        });

        it("should return created post successfully", async () => {
            // Mock successful validation
            jest
                .spyOn(require("../../models/post"), "validatePost")
                .mockReturnValue({
                    success: true,
                    data: mockPost,
                });

            // Mock Post constructor and save
            (Post as unknown as jest.Mock).mockImplementation(() => mockCreatedPost);

            // Mock Post.findById with populate chain
            const secondPopulateMock = jest.fn().mockResolvedValue(mockPopulatedPost);
            const firstPopulateMock = jest.fn().mockReturnValue({
                populate: secondPopulateMock
            });
            (Post.findById as unknown as jest.Mock).mockReturnValue({
                populate: firstPopulateMock
            });

            // Mock User.findById to return user
            (User.findById as unknown as jest.Mock).mockResolvedValue(mockUser);

            // Mock User.findByIdAndUpdate
            (User.findByIdAndUpdate as unknown as jest.Mock).mockResolvedValue({
                ...mockUser,
                posts: [mockCreatedPost._id]
            });

            const result = await postService.createPost(validUserId, mockPost);

            // Verify all the calls were made correctly
            expect(Post).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...mockPost,
                    author_id: validUserId,
                    likes: [],
                    comments: [],
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                })
            );

            expect(mockCreatedPost.save).toHaveBeenCalled();

            expect(Post.findById).toHaveBeenCalledWith(mockCreatedPost._id);
            expect(firstPopulateMock).toHaveBeenCalledWith("author_id", "username email avatar");
            expect(secondPopulateMock).toHaveBeenCalledWith("comments", "content createdAt");

            expect(User.findById).toHaveBeenCalledWith(validUserId);
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                validUserId,
                {$push: {posts: mockCreatedPost.id}},
                {new: true}
            );

            expect(result).toEqual(mockPopulatedPost);
        });

        it("should handle empty userId (null/undefined)", async () => {
            await expect(postService.createPost(null as any, mockPost)).rejects.toEqual({
                status: 401,
                message: "User not authenticated",
            });

            await expect(postService.createPost(undefined as any, mockPost)).rejects.toEqual({
                status: 401,
                message: "User not authenticated",
            });
        });

        it("should create post with minimal data", async () => {
            const minimalPost = {
                title: "Minimal Post",
                content: "Minimal content"
            };

            // Mock successful validation
            jest
                .spyOn(require("../../models/post"), "validatePost")
                .mockReturnValue({
                    success: true,
                    data: minimalPost,
                });

            const minimalCreatedPost = {
                _id: "64c9f5a7b9e7c4e8d7654321",
                id: "64c9f5a7b9e7c4e8d7654321", // Add id property
                ...minimalPost,
                author_id: validUserId,
                likes: [],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                save: jest.fn().mockResolvedValue(true)
            };

            // Mock Post constructor and save
            (Post as unknown as jest.Mock).mockImplementation(() => minimalCreatedPost);

            // Mock the rest of the chain
            const secondPopulateMock = jest.fn().mockResolvedValue({
                ...minimalCreatedPost,
                author_id: mockUser
            });
            const firstPopulateMock = jest.fn().mockReturnValue({
                populate: secondPopulateMock
            });
            (Post.findById as unknown as jest.Mock).mockReturnValue({
                populate: firstPopulateMock
            });

            (User.findById as unknown as jest.Mock).mockResolvedValue(mockUser);
            (User.findByIdAndUpdate as unknown as jest.Mock).mockResolvedValue(mockUser);

            const result = await postService.createPost(validUserId, minimalPost);

            expect(Post).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Minimal Post",
                    content: "Minimal content",
                    author_id: validUserId,
                    likes: [],
                    comments: [],
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                })
            );

            expect(result).toBeDefined();
        });
    });

    describe("deletePost", () => {
        it("should throw 404 if post not found", async () => {
            // Mock Post.findById to return null
            (Post.findById as unknown as jest.Mock).mockResolvedValue(null);

            await expect(postService.deletePost(validUserId)).rejects.toEqual({
                status: 404,
                message: "Post not found"
            });

            expect(Post.findById).toHaveBeenCalledWith(validUserId);
        });

        it("should handle Post.findById failure", async () => {
            // Mock Post.findById to throw error
            (Post.findById as unknown as jest.Mock).mockRejectedValue(new Error("Database error"));

            await expect(postService.deletePost(validUserId)).rejects.toThrow("Database error");

            expect(Post.findById).toHaveBeenCalledWith(validUserId);
        });

        it("should handle Post.deleteOne failure", async () => {
            const mockFoundPost = {
                _id: "64c9f5a7b9e7c4e8d7654321",
                title: "Test Post",
                content: "Test content"
            };

            // Mock Post.findById to return a post
            (Post.findById as unknown as jest.Mock).mockResolvedValue(mockFoundPost);

            // Mock Post.deleteOne to fail
            (Post.deleteOne as unknown as jest.Mock).mockRejectedValue(new Error("Delete failed"));

            await expect(postService.deletePost("64c9f5a7b9e7c4e8d7654321")).rejects.toThrow("Delete failed");

            expect(Post.findById).toHaveBeenCalledWith("64c9f5a7b9e7c4e8d7654321");
            expect(Post.deleteOne).toHaveBeenCalledWith({_id: "64c9f5a7b9e7c4e8d7654321"});
        });

        it("should delete post successfully and return the deleted post", async () => {
            const mockFoundPost = {
                _id: "64c9f5a7b9e7c4e8d7654321",
                title: "Test Post",
                content: "Test content",
                author_id: validUserId,
                likes: [],
                comments: []
            };

            // Mock Post.findById to return a post
            (Post.findById as unknown as jest.Mock).mockResolvedValue(mockFoundPost);

            // Mock Post.deleteOne to succeed
            (Post.deleteOne as unknown as jest.Mock).mockResolvedValue({deletedCount: 1});

            const result = await postService.deletePost("64c9f5a7b9e7c4e8d7654321");

            expect(Post.findById).toHaveBeenCalledWith("64c9f5a7b9e7c4e8d7654321");
            expect(Post.deleteOne).toHaveBeenCalledWith({_id: "64c9f5a7b9e7c4e8d7654321"});
            expect(result).toEqual(mockFoundPost);
        });

        it("should handle empty postId", async () => {
            // Mock Post.findById to return null for empty string
            (Post.findById as unknown as jest.Mock).mockResolvedValue(null);

            await expect(postService.deletePost("")).rejects.toEqual({
                status: 404,
                message: "Post not found"
            });

            expect(Post.findById).toHaveBeenCalledWith("");
        });

        it("should handle null/undefined postId", async () => {
            // Mock Post.findById to return null for invalid IDs
            (Post.findById as unknown as jest.Mock).mockResolvedValue(null);

            await expect(postService.deletePost(null as any)).rejects.toEqual({
                status: 404,
                message: "Post not found"
            });

            await expect(postService.deletePost(undefined as any)).rejects.toEqual({
                status: 404,
                message: "Post not found"
            });
        });
    });

    describe("getAllPosts", () => {
        it("should return all posts successfully", async () => {
            const mockPosts = [
                {
                    _id: "64c9f5a7b9e7c4e8d7654321",
                    title: "Post 1",
                    content: "Content 1",
                    author_id: {
                        _id: validUserId,
                        name: "John Doe",
                        email: "john@example.com",
                        avatar: "avatar1.jpg",
                        username: "johndoe"
                    },
                    comments: [],
                    createdAt: new Date("2023-12-01"),
                    likes: []
                },
                {
                    _id: "64c9f5a7b9e7c4e8d7654322",
                    title: "Post 2",
                    content: "Content 2",
                    author_id: {
                        _id: "64c9f5a7b9e7c4e8d1234568",
                        name: "Jane Smith",
                        email: "jane@example.com",
                        avatar: "avatar2.jpg",
                        username: "janesmith"
                    },
                    comments: [
                        {
                            _id: "comment1",
                            content: "Great post!",
                            createdAt: new Date("2023-12-02")
                        }
                    ],
                    createdAt: new Date("2023-12-02"),
                    likes: []
                }
            ];

            // Mock the chain of Post.find().sort().populate().populate()
            const secondPopulateMock = jest.fn().mockResolvedValue(mockPosts);
            const firstPopulateMock = jest.fn().mockReturnValue({
                populate: secondPopulateMock
            });
            const sortMock = jest.fn().mockReturnValue({
                populate: firstPopulateMock
            });
            (Post.find as unknown as jest.Mock).mockReturnValue({
                sort: sortMock
            });

            const result = await postService.getAllPosts();

            expect(Post.find).toHaveBeenCalledWith();
            expect(sortMock).toHaveBeenCalledWith({createdAt: -1});
            expect(firstPopulateMock).toHaveBeenCalledWith('author_id', 'name email avatar username');
            expect(secondPopulateMock).toHaveBeenCalledWith('comments', 'content createdAt');
            expect(result).toEqual(mockPosts);
        });

        it("should return empty array when no posts exist", async () => {
            const emptyPosts: any[] = [];

            // Mock the chain to return empty array
            const secondPopulateMock = jest.fn().mockResolvedValue(emptyPosts);
            const firstPopulateMock = jest.fn().mockReturnValue({
                populate: secondPopulateMock
            });
            const sortMock = jest.fn().mockReturnValue({
                populate: firstPopulateMock
            });
            (Post.find as unknown as jest.Mock).mockReturnValue({
                sort: sortMock
            });

            const result = await postService.getAllPosts();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it("should handle Post.find failure", async () => {
            // Mock Post.find to throw error
            (Post.find as unknown as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockRejectedValue(new Error("Database connection failed"))
                    })
                })
            });

            await expect(postService.getAllPosts()).rejects.toThrow("Database connection failed");
        });

        it("should handle sort failure", async () => {
            // Mock Post.find but sort fails
            const sortMock = jest.fn().mockImplementation(() => {
                throw new Error("Sort failed");
            });
            (Post.find as unknown as jest.Mock).mockReturnValue({
                sort: sortMock
            });

            await expect(postService.getAllPosts()).rejects.toThrow("Sort failed");
            expect(sortMock).toHaveBeenCalledWith({createdAt: -1});
        });

        it("should handle first populate failure", async () => {
            // Mock chain up to first populate failure
            const firstPopulateMock = jest.fn().mockImplementation(() => {
                throw new Error("First populate failed");
            });
            const sortMock = jest.fn().mockReturnValue({
                populate: firstPopulateMock
            });
            (Post.find as unknown as jest.Mock).mockReturnValue({
                sort: sortMock
            });

            await expect(postService.getAllPosts()).rejects.toThrow("First populate failed");
            expect(firstPopulateMock).toHaveBeenCalledWith('author_id', 'name email avatar username');
        });

        it("should handle second populate failure", async () => {
            // Mock chain up to second populate failure
            const secondPopulateMock = jest.fn().mockRejectedValue(new Error("Second populate failed"));
            const firstPopulateMock = jest.fn().mockReturnValue({
                populate: secondPopulateMock
            });
            const sortMock = jest.fn().mockReturnValue({
                populate: firstPopulateMock
            });
            (Post.find as unknown as jest.Mock).mockReturnValue({
                sort: sortMock
            });

            await expect(postService.getAllPosts()).rejects.toThrow("Second populate failed");
            expect(secondPopulateMock).toHaveBeenCalledWith('comments', 'content createdAt');
        });

        it("should return posts with correct sorting (newest first)", async () => {
            const mockPosts = [
                {
                    _id: "newer_post",
                    title: "Newer Post",
                    createdAt: new Date("2023-12-02"),
                    author_id: {username: "user1"},
                    comments: []
                },
                {
                    _id: "older_post",
                    title: "Older Post",
                    createdAt: new Date("2023-12-01"),
                    author_id: {username: "user2"},
                    comments: []
                }
            ];

            // Mock the full chain
            const secondPopulateMock = jest.fn().mockResolvedValue(mockPosts);
            const firstPopulateMock = jest.fn().mockReturnValue({
                populate: secondPopulateMock
            });
            const sortMock = jest.fn().mockReturnValue({
                populate: firstPopulateMock
            });
            (Post.find as unknown as jest.Mock).mockReturnValue({
                sort: sortMock
            });

            const result = await postService.getAllPosts();

            expect(sortMock).toHaveBeenCalledWith({createdAt: -1}); // -1 means descending (newest first)
            expect(result).toEqual(mockPosts);
            expect(result[0].title).toBe("Newer Post"); // Assuming the mock returns them in the right order
        });
    });
    describe("updatePost", () => {
        it("should update post successfully with all fields", async () => {
            // Mock Post.findById to return existing post
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            // Mock successful validation
            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: {
                    title: "Updated Title",
                    content: "Updated content",
                    image: "new-image.jpg",
                    author_id: "507f1f77bcf86cd799439012",
                    likes: 10,
                    comments: [],
                    createdAt: mockExistingPost.createdAt,
                    updatedAt: expect.any(Date)
                }
            });

            // Mock Post.findByIdAndUpdate to return updated post
            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

            const postBody = {
                title: "Updated Title",
                content: "Updated content",
                image: "new-image.jpg"
            };

            const result = await postService.updatePost(mockExistingPost._id, postBody);

            expect(Post.findById).toHaveBeenCalledWith(mockExistingPost._id);
            expect(validateUpdatePost).toHaveBeenCalledWith({
                title: "Updated Title",
                content: "Updated content",
                image: "new-image.jpg",
                author_id: "507f1f77bcf86cd799439012",
                likes: 10,
                comments: [],
                createdAt: mockExistingPost.createdAt,
                updatedAt: expect.any(Date)
            });
            expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
                mockExistingPost._id,
                {
                    $set: expect.objectContaining({
                        title: "Updated Title",
                        content: "Updated content",
                        image: "new-image.jpg",
                        author_id: "507f1f77bcf86cd799439012",
                        likes: 10,
                        comments: [],
                        createdAt: mockExistingPost.createdAt,
                        updatedAt: expect.any(Date)
                    })
                },
                {
                    new: true,
                    populate: {
                        path: "author_id",
                        select: "username email avatar",
                    },
                }
            );
            expect(result).toEqual(mockUpdatedPost);
        });

        it("should update post successfully with partial fields", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: {
                    title: "Updated Title Only",
                    content: "Original content", // Should keep original
                    image: "original-image.jpg", // Should keep original
                    author_id: "507f1f77bcf86cd799439012",
                    likes: 10,
                    comments: [],
                    createdAt: mockExistingPost.createdAt,
                    updatedAt: expect.any(Date)
                }
            });

            const partialUpdatedPost = {
                ...mockExistingPost,
                title: "Updated Title Only",
                updatedAt: new Date(),
                author_id: {
                    _id: "507f1f77bcf86cd799439012",
                    username: "testuser",
                    email: "test@example.com",
                    avatar: "avatar.jpg"
                }
            };

            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(partialUpdatedPost);

            const postBody = {
                title: "Updated Title Only"
                // Only title provided
            };

            const result = await postService.updatePost(mockExistingPost._id, postBody);

            expect(validateUpdatePost).toHaveBeenCalledWith({
                title: "Updated Title Only",
                content: "Original content", // Should retain original
                image: "original-image.jpg", // Should retain original
                author_id: "507f1f77bcf86cd799439012",
                likes: 10,
                comments: [],
                createdAt: mockExistingPost.createdAt,
                updatedAt: expect.any(Date)
            });
            expect(result).toEqual(partialUpdatedPost);
        });

        it("should update post with empty postBody (no changes)", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: {
                    ...mockExistingPost,
                    author_id: "507f1f77bcf86cd799439012",
                    updatedAt: expect.any(Date),
                }
            });

            const noChangePost = {
                ...mockExistingPost,
                updatedAt: new Date(),
                author_id: {
                    _id: "507f1f77bcf86cd799439012",
                    username: "testuser",
                    email: "test@example.com",
                    avatar: "avatar.jpg"
                }
            };

            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(noChangePost);

            const result = await postService.updatePost("507f1f77bcf86cd799439011", {});

            expect(validateUpdatePost).toHaveBeenCalledWith({
                title: "Original Title",
                content: "Original content",
                image: "original-image.jpg",
                author_id: "507f1f77bcf86cd799439012",
                likes: 10,
                comments: [],
                createdAt: mockExistingPost.createdAt,
                updatedAt: expect.any(Date), // 👈 key fix
            });
            expect(result).toEqual(noChangePost);
        });

        it("should throw 404 error when post not found in findById", async () => {
            // Mock Post.findById to return null (post not found)
            (Post.findById as jest.Mock).mockResolvedValue(null);

            const postBody = {
                title: "Updated Title",
                content: "Updated content"
            };

            await expect(postService.updatePost("nonexistent-id", postBody))
                .rejects.toEqual({
                    status: 404,
                    message: "Post not found"
                });

            expect(Post.findById).toHaveBeenCalledWith("nonexistent-id");
            expect(validateUpdatePost).not.toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it("should throw validation error when validation fails", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            // Mock validation failure
            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: false,
                error: {
                    errors: [
                        {
                            path: ["title"],
                            message: "Title is required"
                        },
                        {
                            path: ["content"],
                            message: "Content must be at least 10 characters"
                        }
                    ]
                }
            });

            const postBody = {
                title: "", // Invalid empty title
                content: "short" // Invalid short content
            };

            await expect(postService.updatePost(mockExistingPost._id, postBody))
                .rejects.toEqual({
                    status: 400,
                    message: "Validation failed",
                    errors: [
                        {
                            path: ["title"],
                            message: "Title is required"
                        },
                        {
                            path: ["content"],
                            message: "Content must be at least 10 characters"
                        }
                    ]
                });

            expect(validateUpdatePost).toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it("should throw 404 error when post not found after update", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: mockExistingPost
            });

            // Mock Post.findByIdAndUpdate to return null (post not found after update)
            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            const postBody = {
                title: "Updated Title"
            };

            await expect(postService.updatePost(mockExistingPost._id, postBody))
                .rejects.toEqual({
                    status: 404,
                    message: "Post not found after update"
                });

            expect(Post.findById).toHaveBeenCalled();
            expect(validateUpdatePost).toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).toHaveBeenCalled();
        });

        it("should handle Post.findById failure", async () => {
            // Mock Post.findById to throw error
            (Post.findById as jest.Mock).mockRejectedValue(new Error("Database connection failed"));

            const postBody = {
                title: "Updated Title",
                content: "Updated content"
            };

            await expect(postService.updatePost("507f1f77bcf86cd799439011", postBody))
                .rejects.toThrow("Database connection failed");

            expect(Post.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
            expect(validateUpdatePost).not.toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it("should handle Post.findByIdAndUpdate failure", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: mockExistingPost
            });

            // Mock Post.findByIdAndUpdate to throw error
            (Post.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("Update operation failed"));

            const postBody = {
                title: "Updated Title"
            };

            await expect(postService.updatePost("507f1f77bcf86cd799439011", postBody))
                .rejects.toThrow("Update operation failed");

            expect(Post.findById).toHaveBeenCalled();
            expect(validateUpdatePost).toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).toHaveBeenCalled();
        });

        it("should handle validation throwing an exception", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            // Mock validateUpdatePost to throw an error
            (validateUpdatePost as jest.Mock).mockImplementation(() => {
                throw new Error("Validation function crashed");
            });

            const postBody = {
                title: "Updated Title"
            };

            await expect(postService.updatePost("507f1f77bcf86cd799439011", postBody))
                .rejects.toThrow("Validation function crashed");

            expect(Post.findById).toHaveBeenCalled();
            expect(validateUpdatePost).toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it("should handle null/undefined postId", async () => {
            const postBody = {
                title: "Updated Title"
            };

            // Test null postId
            (Post.findById as jest.Mock).mockResolvedValue(null);

            await expect(postService.updatePost(null as any, postBody))
                .rejects.toEqual({
                    status: 404,
                    message: "Post not found"
                });

            // Test undefined postId
            await expect(postService.updatePost(undefined as any, postBody))
                .rejects.toEqual({
                    status: 404,
                    message: "Post not found"
                });

            expect(validateUpdatePost).not.toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it("should handle empty string postId", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(null);

            const postBody = {
                title: "Updated Title"
            };

            await expect(postService.updatePost("", postBody))
                .rejects.toEqual({
                    status: 404,
                    message: "Post not found"
                });

            expect(Post.findById).toHaveBeenCalledWith("");
            expect(validateUpdatePost).not.toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it("should handle null/undefined postBody", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: {
                    ...mockExistingPost,
                    author_id: "507f1f77bcf86cd799439012",
                    updatedAt: expect.any(Date)
                }
            });

            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

            // Test null postBody
            const result1 = await postService.updatePost("507f1f77bcf86cd799439011", null);
            expect(result1).toEqual(mockUpdatedPost);

            // Test undefined postBody
            const result2 = await postService.updatePost("507f1f77bcf86cd799439011", undefined);
            expect(result2).toEqual(mockUpdatedPost);

            // Verify that original values are preserved when postBody is null/undefined
            expect(validateUpdatePost).toHaveBeenCalledWith({
                title: "Original Title", // Should keep original values
                content: "Original content",
                image: "original-image.jpg",
                author_id: "507f1f77bcf86cd799439012",
                likes: 10,
                comments: [],
                createdAt: mockExistingPost.createdAt,
                updatedAt: expect.any(Date)
            });
        });

        it("should preserve original values when postBody fields are null/undefined", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: mockExistingPost
            });

            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

            const postBody = {
                title: null,
                content: undefined,
                image: null
            };

            await postService.updatePost("507f1f77bcf86cd799439011", postBody);

            // Verify that nullish coalescing (??) works correctly
            expect(validateUpdatePost).toHaveBeenCalledWith({
                title: "Original Title", // Should use original when postBody.title is null
                content: "Original content", // Should use original when postBody.content is undefined
                image: "original-image.jpg", // Should use original when postBody.image is null
                author_id: "507f1f77bcf86cd799439012",
                likes: 10,
                comments: [],
                createdAt: mockExistingPost.createdAt,
                updatedAt: expect.any(Date)
            });
        });

        it("should handle author_id.toString() correctly", async () => {
            const mockPostWithObjectId = {
                ...mockExistingPost,
                author_id: {
                    _id: "507f1f77bcf86cd799439012",
                    toString: jest.fn().mockReturnValue("507f1f77bcf86cd799439012")
                }
            };

            (Post.findById as jest.Mock).mockResolvedValue(mockPostWithObjectId);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: mockExistingPost
            });

            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

            const postBody = {
                title: "Updated Title"
            };

            await postService.updatePost("507f1f77bcf86cd799439011", postBody);

            expect(mockPostWithObjectId.author_id.toString).toHaveBeenCalled();
            expect(validateUpdatePost).toHaveBeenCalledWith({
                title: "Updated Title",
                content: "Original content",
                image: "original-image.jpg",
                author_id: "507f1f77bcf86cd799439012", // Should be string
                likes: 10,
                comments: [],
                createdAt: mockExistingPost.createdAt,
                updatedAt: expect.any(Date)
            });
        });

        it("should handle validation error with multiple errors", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: false,
                error: {
                    errors: [
                        {
                            path: ["title"],
                            message: "Title is required"
                        },
                        {
                            path: ["content"],
                            message: "Content must be at least 10 characters"
                        },
                        {
                            path: ["image"],
                            message: "Image URL is invalid"
                        }
                    ]
                }
            });

            const postBody = {
                title: "",
                content: "short",
                image: "invalid-url"
            };

            await expect(postService.updatePost(mockExistingPost._id, postBody))
                .rejects.toEqual({
                    status: 400,
                    message: "Validation failed",
                    errors: [
                        {
                            path: ["title"],
                            message: "Title is required"
                        },
                        {
                            path: ["content"],
                            message: "Content must be at least 10 characters"
                        },
                        {
                            path: ["image"],
                            message: "Image URL is invalid"
                        }
                    ]
                });

            expect(validateUpdatePost).toHaveBeenCalled();
            expect(Post.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it("should handle when updatedAt is already provided in postBody", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            const providedUpdatedAt = new Date("2024-06-15");

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: mockExistingPost
            });

            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

            const postBody = {
                title: "Updated Title",
                updatedAt: providedUpdatedAt // User provides updatedAt (should be ignored)
            };

            await postService.updatePost("507f1f77bcf86cd799439011", postBody);

            // Should always use new Date() for updatedAt, not the provided one
            expect(validateUpdatePost).toHaveBeenCalledWith({
                title: "Updated Title",
                content: "Original content",
                image: "original-image.jpg",
                author_id: "507f1f77bcf86cd799439012",
                likes: 10,
                comments: [],
                createdAt: mockExistingPost.createdAt,
                updatedAt: expect.any(Date) // Should be new Date(), not providedUpdatedAt
            });
        });

        it("should handle complex post with likes and comments", async () => {
            const complexPost = {
                ...mockExistingPost,
                likes: [validUserId, "another-user-id"],
                comments: ["comment1", "comment2", "comment3"]
            };

            (Post.findById as jest.Mock).mockResolvedValue(complexPost);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: complexPost
            });

            const complexUpdatedPost = {
                ...complexPost,
                title: "Updated Complex Post",
                author_id: {
                    _id: "507f1f77bcf86cd799439012",
                    username: "testuser",
                    email: "test@example.com",
                    avatar: "avatar.jpg"
                }
            };

            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(complexUpdatedPost);

            const postBody = {
                title: "Updated Complex Post"
            };

            const result = await postService.updatePost("507f1f77bcf86cd799439011", postBody);

            expect(validateUpdatePost).toHaveBeenCalledWith({
                title: "Updated Complex Post",
                content: "Original content",
                image: "original-image.jpg",
                author_id: "507f1f77bcf86cd799439012",
                likes: [validUserId, "another-user-id"], // Should preserve likes
                comments: ["comment1", "comment2", "comment3"], // Should preserve comments
                createdAt: complexPost.createdAt,
                updatedAt: expect.any(Date)
            });
            expect(result).toEqual(complexUpdatedPost);
        });

        it("should verify Post.findByIdAndUpdate is called with correct parameters", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            const expectedUpdateData = {
                title: "New Title",
                content: "New Content",
                image: "new-image.jpg",
                author_id: "507f1f77bcf86cd799439012",
                likes: 10,
                comments: [],
                createdAt: mockExistingPost.createdAt,
                updatedAt: expect.any(Date)
            };

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: expectedUpdateData
            });

            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

            const postBody = {
                title: "New Title",
                content: "New Content",
                image: "new-image.jpg"
            };

            await postService.updatePost("507f1f77bcf86cd799439011", postBody);

            expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
                "507f1f77bcf86cd799439011",
                {$set: expectedUpdateData},
                {
                    new: true,
                    populate: {
                        path: "author_id",
                        select: "username email avatar",
                    },
                }
            );
        });

        it("should handle edge case with falsy but valid values", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: mockExistingPost
            });

            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

            const postBody = {
                title: "0", // Falsy but valid string
                content: "false", // Falsy-like but valid string
                image: "" // Empty string (falsy)
            };

            await postService.updatePost("507f1f77bcf86cd799439011", postBody);

            // Should use provided values even if they're falsy (but not null/undefined)
            expect(validateUpdatePost).toHaveBeenCalledWith({
                title: "0", // Should use provided falsy value
                content: "false", // Should use provided falsy value
                image: "", // Should use provided empty string
                author_id: "507f1f77bcf86cd799439012",
                likes: 10,
                comments: [],
                createdAt: mockExistingPost.createdAt,
                updatedAt: expect.any(Date)
            });
        });

        it("should handle mixed partial update with some null values", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockExistingPost);

            (validateUpdatePost as jest.Mock).mockReturnValue({
                success: true,
                data: mockExistingPost
            });

            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

            const postBody = {
                title: "Updated Title", // Valid new value
                content: null, // Null - should use original
                image: undefined, // Undefined - should use original
                extraField: "ignored" // Extra field that should be ignored
            };

            await postService.updatePost("507f1f77bcf86cd799439011", postBody);

            expect(validateUpdatePost).toHaveBeenCalledWith({
                title: "Updated Title", // Should use new value
                content: "Original content", // Should use original (postBody.content was null)
                image: "original-image.jpg", // Should use original (postBody.image was undefined)
                author_id: "507f1f77bcf86cd799439012",
                likes: 10,
                comments: [],
                createdAt: mockExistingPost.createdAt,
                updatedAt: expect.any(Date)
            });
            // Note: extraField should not appear in the updateData
        });
    });
    describe("likePost", () => {
        describe("likePost", () => {
            let mockPost: any;

            beforeEach(() => {
                mockPost = {
                    ...mockExistingPost,
                    likes: [], // reset likes
                    save: jest.fn().mockResolvedValue(true),
                };
            });

            it("should throw 404 if post not found", async () => {
                (Post.findById as jest.Mock).mockResolvedValue(null);

                await expect(
                    postService.likePost("nonexistent-id", validUserId)
                ).rejects.toEqual({status: 404, message: "Post not found"});
            });

            it("should like post successfully if not already liked", async () => {
                (Post.findById as jest.Mock).mockResolvedValue(mockPost);

                const result = await postService.likePost(
                    mockPost._id,
                    validUserId
                );

                expect(result.alreadyLiked).toBe(false);
                expect(result.likes).toHaveLength(1);
                expect(result.likes[0].user.toString()).toBe(validUserId);
                expect(mockPost.save).toHaveBeenCalled();
            });

            it("should unlike post if already liked", async () => {
                mockPost.likes = [
                    {user: {toString: () => validUserId}}, // simulate already liked
                ];
                (Post.findById as jest.Mock).mockResolvedValue(mockPost);

                const result = await postService.likePost(
                    mockPost._id,
                    validUserId
                );

                expect(result.alreadyLiked).toBe(true);
                expect(result.likes).toHaveLength(0);
                expect(mockPost.save).toHaveBeenCalled();
            });

            it("should handle multiple likes and only remove the current user’s like", async () => {
                const anotherUserId = "507f1f77bcf86cd799439099";
                mockPost.likes = [
                    {user: {toString: () => validUserId}},
                    {user: {toString: () => anotherUserId}},
                ];
                (Post.findById as jest.Mock).mockResolvedValue(mockPost);

                const result = await postService.likePost(
                    mockPost._id,
                    validUserId
                );

                expect(result.alreadyLiked).toBe(true);
                expect(result.likes).toHaveLength(1);
                expect(result.likes[0].user.toString()).toBe(anotherUserId);
                expect(mockPost.save).toHaveBeenCalled();
            });

            it("should throw error if Post.findById fails", async () => {
                (Post.findById as jest.Mock).mockRejectedValue(new Error("DB error"));

                await expect(
                    postService.likePost(mockPost._id, validUserId)
                ).rejects.toThrow("DB error");
            });

            it("should throw error if save fails", async () => {
                mockPost.save = jest.fn().mockRejectedValue(new Error("Save failed"));
                (Post.findById as jest.Mock).mockResolvedValue(mockPost);

                await expect(
                    postService.likePost(mockPost._id, validUserId)
                ).rejects.toThrow("Save failed");
            });
        });
    });
    describe("getCommentsByPostId", () => {
        it("should throw 404 if post is not found", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(null);

            await expect(postService.getCommentsByPostId(mockExistingPost._id))
                .rejects.toEqual({status: 404, message: "Post not found"});

            expect(Post.findById).toHaveBeenCalledWith(mockExistingPost._id);
        });

        it("should return comments for a valid post", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockPost);

            const sortMock = jest.fn().mockResolvedValue(mockComments);
            const populateMock = jest.fn().mockReturnValue({sort: sortMock});
            (Comment.find as unknown as jest.Mock).mockReturnValue({
                populate: populateMock,
            });

            const result = await postService.getCommentsByPostId(mockExistingPost._id);

            expect(Post.findById).toHaveBeenCalledWith(mockExistingPost._id);
            expect(Comment.find).toHaveBeenCalledWith({_id: {$in: mockPost.comments}});
            expect(populateMock).toHaveBeenCalledWith("user", "name email");
            expect(sortMock).toHaveBeenCalledWith({createdAt: -1});
            expect(result).toEqual(mockComments);
        });

        it("should return empty array if post has no comments", async () => {
            (Post.findById as jest.Mock).mockResolvedValue({_id: mockExistingPost._id, comments: []});

            const sortMock = jest.fn().mockResolvedValue([]);
            const populateMock = jest.fn().mockReturnValue({sort: sortMock});
            (Comment.find as unknown as jest.Mock).mockReturnValue({
                populate: populateMock,
            });

            const result = await postService.getCommentsByPostId(mockExistingPost._id);

            expect(Comment.find).toHaveBeenCalledWith({_id: {$in: []}});
            expect(result).toEqual([]);
        });

        it("should handle Post.findById failure", async () => {
            (Post.findById as jest.Mock).mockRejectedValue(new Error("DB error"));

            await expect(postService.getCommentsByPostId(mockExistingPost._id))
                .rejects.toThrow("DB error");
        });

        it("should handle Comment.find failure", async () => {
            (Post.findById as jest.Mock).mockResolvedValue(mockPost);

            (Comment.find as jest.Mock).mockImplementation(() => {
                throw new Error("Comment DB error");
            });

            await expect(postService.getCommentsByPostId(mockExistingPost._id))
                .rejects.toThrow("Comment DB error");
        });
    })

});