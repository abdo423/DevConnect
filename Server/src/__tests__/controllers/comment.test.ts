import {Request, Response} from "express";
import * as CommentController from "../../controllers/comment";
import * as CommentService from "../../services/commentService";
import dotenv from "dotenv";

dotenv.config();

const userId = process.env["USER_ID"] as string;
const postId = process.env["POST_ID"] as string;
const commentId = process.env["COMMENT_ID"] as string;

describe("CommentController.createComment", () => {
    let res: Partial<Response>;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a comment successfully", async () => {
        const mockComment = {
            _id: "mockCommentId",
            content: "This is a valid test content",
            user: {_id: userId, username: "JohnDoe", avatar: "avatar.png"},
            post: postId,
            likes: [],
            createdAt: new Date()
        };

        const req = {
            user: {id: userId},
            body: {
                post: postId,
                content: "This is a valid test content"
            }
        } as Partial<Request>;

        jest.spyOn(CommentService, "createComment").mockResolvedValue(mockComment as unknown as Awaited<ReturnType<typeof CommentService.createComment>>);

        await CommentController.createComment(req as Request, res as Response);

        expect(CommentService.createComment).toHaveBeenCalledWith(
            userId,
            postId,
            "This is a valid test content"
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Comment created successfully",
            comment: mockComment
        });
    });

    it("should return 400 if validation fails - content too short", async () => {
        const req = {
            user: {id: userId},
            body: {
                post: postId,
                content: "hi"
            }
        } as Partial<Request>;

        const mockValidationError = {
            status: 400,
            message: "Validation failed",
            errors: [
                {
                    field: "content",
                    message: "Content must be at least 5 characters long"
                }
            ]
        };

        jest.spyOn(CommentService, "createComment").mockRejectedValue(mockValidationError);

        await CommentController.createComment(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Validation failed",
            errors: mockValidationError.errors
        });
    });

    it("should return 401 if userId is missing", async () => {
        const req = {
            body: {
                post: postId,
                content: "Valid content here"
            }
        } as Partial<Request>;

        await CommentController.createComment(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized: User not authenticated"
        });
    });

    it("should return 400 if post is missing", async () => {
        const req = {
            user: {id: userId},
            body: {
                content: "Valid content here"
            }
        } as Partial<Request>;

        const mockValidationError = {
            status: 400,
            message: "Validation failed",
            errors: [
                {
                    field: "post",
                    message: "Post ID is required"
                }
            ]
        };

        jest.spyOn(CommentService, "createComment").mockRejectedValue(mockValidationError);

        await CommentController.createComment(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Validation failed",
            errors: mockValidationError.errors
        });
    });

    it("should return 400 if content is missing", async () => {
        const req = {
            user: {id: userId},
            body: {
                post: postId
            }
        } as Partial<Request>;

        const mockValidationError = {
            status: 400,
            message: "Validation failed",
            errors: [
                {
                    field: "content",
                    message: "Content is required"
                }
            ]
        };
        jest.spyOn(CommentService, "createComment").mockRejectedValue(mockValidationError);
        await CommentController.createComment(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Validation failed",
            errors: mockValidationError.errors
        });
    });

    it("should return 500 on unexpected errors", async () => {
        const req = {
            user: {id: userId},
            body: {
                post: postId,
                content: "Valid content here"
            }
        } as Partial<Request>;

        const unexpectedError = new Error("Database connection failed");
        jest.spyOn(CommentService, "createComment").mockRejectedValue(unexpectedError);
        await CommentController.createComment(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Database connection failed"
        });
    });

    it("should return 400 if post ID format is invalid", async () => {
        const req = {
            user: {id: userId},
            body: {
                post: "invalid-post-id",
                content: "Valid content here"
            }
        } as Partial<Request>;

        const mockValidationError = {
            status: 400,
            message: "Validation failed",
            errors: [
                {
                    field: "post",
                    message: "Invalid post ID format"
                }
            ]
        };

        jest.spyOn(CommentService, "createComment").mockRejectedValue(mockValidationError);
        await CommentController.createComment(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Validation failed",
            errors: mockValidationError.errors
        });
    });

    it("should return 400 if content is too long", async () => {
        const longContent = "a".repeat(501);
        const req = {
            user: {id: userId},
            body: {
                post: postId,
                content: longContent
            }
        } as Partial<Request>;

        const mockValidationError = {
            status: 400,
            message: "Validation failed",
            errors: [
                {
                    field: "content",
                    message: "Content cannot exceed 500 characters"
                }
            ]
        };
        jest.spyOn(CommentService, "createComment").mockRejectedValue(mockValidationError);
        await CommentController.createComment(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Validation failed",
            errors: mockValidationError.errors
        });
    });
});

describe("CommentController.deleteComment", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn().mockReturnThis();
        res = {status: statusMock, json: jsonMock} as Partial<Response>;
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 200 when comment is deleted", async () => {
        req = {params: {id: commentId}};
        jest.spyOn(CommentService, "deleteComment").mockResolvedValue(true);
        await CommentController.deleteComment(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({message: "Comment deleted successfully"});
    });

    it("should return 400 for invalid id", async () => {
        req = {params: {id: "invalid-id"}};
        jest.spyOn(CommentService, "deleteComment").mockRejectedValue({
            status: 400,
            message: "Invalid comment ID"
        });
        await CommentController.deleteComment(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({message: "Invalid comment ID"});
    });

    it("should return 404 if comment not found", async () => {
        req = {params: {id: commentId}};
        jest.spyOn(CommentService, "deleteComment").mockRejectedValue({
            status: 404,
            message: "Comment not found"
        });
        await CommentController.deleteComment(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({message: "Comment not found"});
    });

    it("should return 500 for unexpected errors", async () => {
        req = {params: {id: commentId}};
        jest.spyOn(CommentService, "deleteComment").mockRejectedValue(new Error("Internal server error"));
        await CommentController.deleteComment(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "Internal server error"
        });
    });
});

describe("CommentController.updateComment", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn().mockReturnThis();
        res = {status: statusMock, json: jsonMock} as Partial<Response>;
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 200 when comment is updated successfully", async () => {
        req = {
            params: {id: commentId},
            body: {content: "this is the new comment"}
        };

        const updatedComment = {
            id: commentId,
            content: "this is the new comment",
            user: userId,
            post: postId
        };

        jest.spyOn(CommentService, "updateComment").mockResolvedValue(updatedComment as unknown as Awaited<ReturnType<typeof CommentService.updateComment>>);

        await CommentController.updateComment(req as Request, res as Response);

        expect(CommentService.updateComment).toHaveBeenCalledWith(
            commentId,
            req.body
        );
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "Comment updated successfully",
            comment: updatedComment,
        });
    });
    it("should return 404 if comment not found", async () => {
        req = {
            params: {id: "invalid-id"}, body: {
                content: "this is the new comment"
            }
        };
        jest.spyOn(CommentService, "updateComment").mockRejectedValue({
            status: 404,
            message: "Comment not found"
        });
        await CommentController.updateComment(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({message: "Comment not found"});
    });
    it("should return 400 if comment id is invalid", async () => {
        req = {
            params: {id: "not-a-valid-id"},
            body: {content: "updated content"}
        };

        jest.spyOn(CommentService, "updateComment").mockRejectedValue({
            status: 400,
            message: "Invalid comment id"
        });
        await CommentController.updateComment(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({message: "Invalid comment id"});
    });

    it("should return 400 if no content is provided", async () => {
        req = {params: {id: commentId}, body: {}};
        jest.spyOn(CommentService, "updateComment").mockRejectedValue({
            status: 400,
            message: "Content is required"
        })
        await CommentController.updateComment(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "Content is required"
        });
    });

    it("should return 500 on unexpected error", async () => {
        req = {
            params: {id: commentId},
            body: {content: "this is the new comment"}
        };
        jest.spyOn(CommentService, "updateComment")
            .mockRejectedValue(new Error("Internal Server Error"));
        await CommentController.updateComment(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "Internal Server Error"
        });
    });
});

describe("CommentController.getCommentsByPost", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn().mockReturnThis();
        res = {status: statusMock, json: jsonMock} as Partial<Response>;
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 200 when comments are retrieved successfully", async () => {
        const fakeComments = [
            {id: "1", content: "Nice post!", user: {username: "abdo"}},
        ];
        req = {
            params: {
                id: commentId,
            }
        };
        jest.spyOn(CommentService, "getCommentsByPost").mockResolvedValue(fakeComments as unknown as Awaited<ReturnType<typeof CommentService.getCommentsByPost>>)
        await CommentController.getCommentsByPost(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({comments: fakeComments});
    });
    it("should return 400 if postId is invalid", async () => {
        req = {params: {id: "invalid-id"}};
        (CommentService.getCommentsByPost as jest.Mock).mockRejectedValue({
            status: 400,
            message: "Invalid post ID",
        });
        await CommentController.getCommentsByPost(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({message: "Invalid post ID"});
    });

    it("should return 500 if service throws unexpected error", async () => {
        req = {params: {id: postId}};
        (CommentService.getCommentsByPost as jest.Mock).mockRejectedValue(new Error("DB error"));
        await CommentController.getCommentsByPost(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "DB error",
        });
    });
})

describe("CommentController.likeComment", () => {
    let req: any;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {status: statusMock, json: jsonMock};
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 200 and like the comment if not liked before", async () => {
        req = {
            params: {id: commentId},
            user: {id: userId},
        };
        const mockLikeComment = jest.spyOn(CommentService, "likeComment").mockResolvedValue({
            alreadyLiked: false,
            likes: [userId],
        });
        await CommentController.likeComment(req, res as Response);
        expect(mockLikeComment).toHaveBeenCalledWith(commentId, userId);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "Comment liked",
            likes: [userId],
        });
    });

    it("should return 200 and unlike the comment if already liked", async () => {
        req = {
            params: {id: commentId},
            user: {id: userId}
        };
        const mockLikeComment = jest.spyOn(CommentService, "likeComment").mockResolvedValue({
            alreadyLiked: true,
            likes: [],
        });
        await CommentController.likeComment(req, res as Response);
        expect(mockLikeComment).toHaveBeenCalledWith(commentId, userId);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "Comment unliked",
            likes: [],
        });
    });

    it("should return 401 if user is not authenticated", async () => {
        req = {params: {id: commentId}};
        await CommentController.likeComment(req, res as Response);
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({message: "Unauthorized"});
    });

    it("should return 401 if user id is missing", async () => {
        req = {
            params: {id: commentId},
            user: {}
        };
        await CommentController.likeComment(req, res as Response);
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({message: "Unauthorized"});
    });

    it("should return 400 if commentId is invalid", async () => {
        req = {
            params: {id: "invalid-id"},
            user: {id: userId}
        };
        const mockLikeComment = jest.spyOn(CommentService, "likeComment").mockRejectedValue({
            status: 400,
            message: "Invalid comment ID",
            errors: {id: "Invalid comment ID"}
        });
        await CommentController.likeComment(req, res as Response);
        expect(mockLikeComment).toHaveBeenCalledWith("invalid-id", userId);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "Invalid comment ID",
            errors: {id: "Invalid comment ID"}
        });
    });

    it("should return 400 if userId is invalid", async () => {
        req = {
            params: {id: commentId},
            user: {id: "invalid-user-id"}
        };
        const mockLikeComment = jest.spyOn(CommentService, "likeComment").mockRejectedValue({
            status: 400,
            message: "Invalid user ID",
            errors: {id: "Invalid user ID"}
        });
        await CommentController.likeComment(req, res as Response);
        expect(mockLikeComment).toHaveBeenCalledWith(commentId, "invalid-user-id");
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "Invalid user ID",
            errors: {id: "Invalid user ID"}
        });
    });

    it("should return 404 if comment not found", async () => {
        req = {
            params: {id: commentId},
            user: {id: userId}
        };
        const mockLikeComment = jest.spyOn(CommentService, "likeComment").mockRejectedValue({
            status: 404,
            message: "Comment not found",
        });
        await CommentController.likeComment(req, res as Response);
        expect(mockLikeComment).toHaveBeenCalledWith(commentId, userId);
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({message: "Comment not found"});
    });

    it("should return 500 if service throws unexpected error", async () => {
        req = {
            params: {id: commentId},
            user: {id: userId}
        };
        const mockLikeComment = jest.spyOn(CommentService, "likeComment").mockRejectedValue(new Error("DB error"));
        await CommentController.likeComment(req, res as Response);
        expect(mockLikeComment).toHaveBeenCalledWith(commentId, userId);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({message: "DB error"});
    });
});