import {Request, Response} from "express";
import * as messageController from "../../controllers/message";
import * as messageService from "../../services/messageService";
import dotenv from "dotenv";
import {Types} from "mongoose";

dotenv.config();

const userId = new Types.ObjectId().toString();
const receiverId = new Types.ObjectId().toString();

describe("Message Controller", () => {
    let res: Partial<Response>;
    let req: Partial<Request>;
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

    describe("createMessage", () => {
        it("should create a message and return status 201", async () => {
            req = {
                user: {id: userId},
                body: {
                    content: "this is my message",
                    receiverId: receiverId,
                },
            };

            const mockMessage = {
                _id: "mockMessageId",
                text: "this is my message",
                createdAt: new Date(),
                senderId: userId,
                receiverId: receiverId,
            };

            jest.spyOn(messageService, "createMessageService").mockResolvedValue(mockMessage as unknown as Awaited<ReturnType<typeof messageService.createMessageService>>);

            await messageController.createMessage(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Message sent successfully",
                data: mockMessage,
            });
        });

        it("should return status 401 when user not authenticated", async () => {
            req = {
                body: {
                    content: "this is my message",
                    receiverId: receiverId,
                },
            };

            jest.spyOn(messageService, "createMessageService").mockRejectedValue({
                status: 401,
                message: "User not authenticated"
            });

            await messageController.createMessage(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "User not authenticated"
            });
        });

        it("should return status 400 if receiverId is missing", async () => {
            req = {
                user: {id: userId},
                body: {
                    content: "this is my message",
                }
            };

            jest.spyOn(messageService, "createMessageService").mockRejectedValue({
                status: 400,
                message: "Receiver ID is required"
            });

            await messageController.createMessage(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Receiver ID is required",
            });
        });

        it("should return status 404 if user not found", async () => {
            req = {
                user: {id: userId},
                body: {
                    content: "this is my message",
                    receiverId: receiverId,
                }
            };

            jest.spyOn(messageService, "createMessageService").mockRejectedValue({
                status: 404,
                message: "User not found"
            });

            await messageController.createMessage(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "User not found",
            });
        });

        it("should return status 403 if user is not following receiver", async () => {
            req = {
                user: {id: userId},
                body: {
                    content: "this is my message",
                    receiverId: receiverId,
                }
            };

            jest.spyOn(messageService, "createMessageService").mockRejectedValue({
                status: 403,
                message: "Cannot send message to user you are not following"
            });

            await messageController.createMessage(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Cannot send message to user you are not following",
            });
        });

        it("should return status 400 if validation fails with empty content", async () => {
            req = {
                user: {id: userId},
                body: {
                    content: "", // Empty content to trigger validation error
                    receiverId: receiverId,
                }
            };

            jest.spyOn(messageService, "createMessageService").mockRejectedValue({
                status: 400,
                message: "Validation failed",
                errors: [
                    {
                        field: "content",
                        message: "Content is required"
                    }
                ]
            });

            await messageController.createMessage(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Validation failed",
                errors: [
                    {
                        field: "content",
                        message: "Content is required"
                    }
                ]
            });
        });

        it("should return status 400 if content is missing", async () => {
            req = {
                user: {id: userId},
                body: {
                    receiverId: receiverId,
                }
            };

            jest.spyOn(messageService, "createMessageService").mockRejectedValue({
                status: 400,
                message: "Validation failed",
                errors: [
                    {
                        field: "content",
                        message: "Content is required"
                    }
                ]
            });

            await messageController.createMessage(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Validation failed",
                errors: [
                    {
                        field: "content",
                        message: "Content is required"
                    }
                ]
            });
        });

        it("should return status 400 if content is too long", async () => {
            const longContent = "a".repeat(1001); // Assuming 1000 character limit
            req = {
                user: {id: userId},
                body: {
                    content: longContent,
                    receiverId: receiverId,
                }
            };

            jest.spyOn(messageService, "createMessageService").mockRejectedValue({
                status: 400,
                message: "Validation failed",
                errors: [
                    {
                        field: "content",
                        message: "Content cannot exceed 1000 characters"
                    }
                ]
            });

            await messageController.createMessage(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Validation failed",
                errors: [
                    {
                        field: "content",
                        message: "Content cannot exceed 1000 characters"
                    }
                ]
            });
        });

        it("should return status 400 if receiverId format is invalid", async () => {
            req = {
                user: {id: userId},
                body: {
                    content: "this is my message",
                    receiverId: "invalid-id-format",
                }
            };

            jest.spyOn(messageService, "createMessageService").mockRejectedValue({
                status: 400,
                message: "Validation failed",
                errors: [
                    {
                        field: "receiverId",
                        message: "Invalid receiver ID format"
                    }
                ]
            });

            await messageController.createMessage(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Validation failed",
                errors: [
                    {
                        field: "receiverId",
                        message: "Invalid receiver ID format"
                    }
                ]
            });
        });

        it("should return status 500 on unexpected errors", async () => {
            req = {
                user: {id: userId},
                body: {
                    content: "this is my message",
                    receiverId: receiverId,
                }
            };

            jest.spyOn(messageService, "createMessageService").mockRejectedValue(new Error("Database connection failed"));

            await messageController.createMessage(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Database connection failed",
            });
        });
    });

    describe("getMessagesBetweenUsers", () => {
        it("should get messages between users and return status 200", async () => {
            req = {
                user: {id: userId},
                params: {id: receiverId}
            };

            const mockMessages = [
                {
                    _id: "message1",
                    text: "Hello there",
                    createdAt: new Date("2024-01-01"),
                    senderId: userId,
                    receiverId: receiverId,
                },
                {
                    _id: "message2",
                    text: "Hi back",
                    createdAt: new Date("2024-01-02"),
                    senderId: receiverId,
                    receiverId: userId,
                }
            ];

            jest.spyOn(messageService, "getMessagesBetweenUsersService").mockResolvedValue(mockMessages as unknown as Awaited<ReturnType<typeof messageService.getMessagesBetweenUsersService>>);

            await messageController.getMessagesBetweenUsers(req as Request, res as Response);

            expect(messageService.getMessagesBetweenUsersService).toHaveBeenCalledWith(userId, receiverId);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                messages: mockMessages,
                count: 2
            });
        });

        it("should return status 401 when user not authenticated", async () => {
            req = {
                params: {id: receiverId}
            };

            jest.spyOn(messageService, "getMessagesBetweenUsersService").mockRejectedValue({
                status: 401,
                message: "User not authenticated"
            });

            await messageController.getMessagesBetweenUsers(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "User not authenticated",
                errors: undefined
            });
        });

        it("should return status 400 if receiver ID is missing", async () => {
            req = {
                user: {id: userId},
                params: {}
            };

            jest.spyOn(messageService, "getMessagesBetweenUsersService").mockRejectedValue({
                status: 400,
                message: "Receiver ID is required"
            });

            await messageController.getMessagesBetweenUsers(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Receiver ID is required",
                errors: undefined
            });
        });

        it("should return status 400 if receiver ID format is invalid", async () => {
            req = {
                user: {id: userId},
                params: {id: "invalid-id-format"}
            };

            jest.spyOn(messageService, "getMessagesBetweenUsersService").mockRejectedValue({
                status: 400,
                message: "Invalid receiver ID format"
            });

            await messageController.getMessagesBetweenUsers(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Invalid receiver ID format",
                errors: undefined
            });
        });

        it("should return empty messages array when no messages exist", async () => {
            req = {
                user: {id: userId},
                params: {id: receiverId}
            };

            const emptyMessages: any[] = [];

            jest.spyOn(messageService, "getMessagesBetweenUsersService").mockResolvedValue(emptyMessages);

            await messageController.getMessagesBetweenUsers(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                messages: emptyMessages,
                count: 0
            });
        });

        it("should return status 500 on unexpected errors", async () => {
            req = {
                user: {id: userId},
                params: {id: receiverId}
            };

            jest.spyOn(messageService, "getMessagesBetweenUsersService").mockRejectedValue(new Error("Database connection failed"));

            await messageController.getMessagesBetweenUsers(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Database connection failed",
                errors: undefined
            });
        });
    });
    describe("getSendersForCurrentUser", () => {
        it("should return senders and count when successful", async () => {
            req = { user: { id: userId } };

            const mockSenders = [
                { _id: "s1", username: "Alice", avatar: "alice.png" },
                { _id: "s2", username: "Bob", avatar: "bob.png" }
            ];

            jest.spyOn(messageService, "getSendersForCurrentUserService")
                .mockResolvedValue(mockSenders as unknown as Awaited<ReturnType<typeof messageService.getSendersForCurrentUserService>>);

            await messageController.getSendersForCurrentUser(req as Request, res as Response);

            expect(messageService.getSendersForCurrentUserService).toHaveBeenCalledWith(userId);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                senders: mockSenders,
                count: mockSenders.length
            });
        });

        it("should return 401 when user is not authenticated", async () => {
            req = { user: undefined };

            jest.spyOn(messageService, "getSendersForCurrentUserService")
                .mockRejectedValue({ status: 401, message: "User not authenticated" });

            await messageController.getSendersForCurrentUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "User not authenticated",
                errors: undefined
            });
        });

        it("should return empty senders array when no senders exist", async () => {
            req = { user: { id: userId } };

            const emptySenders: any[] = [];

            jest.spyOn(messageService, "getSendersForCurrentUserService")
                .mockResolvedValue(emptySenders);

            await messageController.getSendersForCurrentUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                senders: emptySenders,
                count: 0
            });
        });

        it("should return 500 on unexpected error", async () => {
            req = { user: { id: userId } };

            jest.spyOn(messageService, "getSendersForCurrentUserService")
                .mockRejectedValue(new Error("Database connection failed"));

            await messageController.getSendersForCurrentUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Database connection failed",
                errors: undefined
            });
        });
    });

});