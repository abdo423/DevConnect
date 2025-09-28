import request from "supertest";
import app from "../../app";
import User from "../../models/user";
import { Types } from "mongoose";
import Message from "../../models/message";

describe("Message routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /send", () => {
        it("Message should be sent successfully", async () => {
            // Generate valid ObjectIds
            const currentUserId = new Types.ObjectId().toString();
            const receiverId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: currentUserId,
                    email: "current@example.com",
                    username: "currentUser"
                });

            // Mock config
            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock User.findById to return a user with following array
            const mockUser = {
                _id: new Types.ObjectId(currentUserId),
                username: "currentUser",
                email: "current@example.com",
                following: [new Types.ObjectId(receiverId)] // User follows the receiver
            };

            const userFindByIdMock = jest.spyOn(User, 'findById')
                .mockResolvedValue(mockUser as Partial<typeof User>);

            // Mock Message constructor and save method
            const mockSavedMessage = {
                _id: new Types.ObjectId(),
                senderId: new Types.ObjectId(currentUserId),
                receiverId: new Types.ObjectId(receiverId),
                content: "this is my message",
                createdAt: new Date()
            };

            const messageMock = jest.spyOn(Message.prototype, 'save')
                .mockResolvedValue(mockSavedMessage as Partial<typeof Message>);

            // Make the request with proper body data
            const res = await request(app)
                .post("/message/send")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    receiverId: receiverId,
                    content: "this is my message"
                });

            // Test assertions
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Message sent successfully");
            expect(res.body.data).toBeDefined();

            // Verify mocks were called
            expect(userFindByIdMock).toHaveBeenCalledWith(currentUserId);
            expect(messageMock).toHaveBeenCalled();
        });

        it("Should return 401 if user is not authenticated", async () => {
            const res = await request(app)
                .post("/message/send")
                .send({
                    receiverId: new Types.ObjectId().toString(),
                    content: "this is my message"
                });

            expect(res.status).toBe(401);
        });

        it("Should return 404 if user not found", async () => {
            const nonexistentUserId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: nonexistentUserId,
                    email: "test@example.com",
                    username: "testUser"
                });

            // Mock User.findById to return null
            const userFindByIdMock = jest.spyOn(User, 'findById')
                .mockResolvedValue(null);

            const res = await request(app)
                .post("/message/send")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    receiverId: new Types.ObjectId().toString(),
                    content: "this is my message"
                });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("User not found");
        });

        it("Should return 403 if user is not following the receiver", async () => {
            const currentUserId = new Types.ObjectId().toString();
            const receiverId = new Types.ObjectId().toString();
            const someOtherUserId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: currentUserId,
                    email: "current@example.com",
                    username: "currentUser"
                });

            // Mock User.findById to return a user NOT following the receiver
            const mockUser = {
                _id: new Types.ObjectId(currentUserId),
                username: "currentUser",
                email: "current@example.com",
                following: [new Types.ObjectId(someOtherUserId)] // Not following the receiver
            };

            const userFindByIdMock = jest.spyOn(User, 'findById')
                .mockResolvedValue(mockUser as Partial<typeof User>);

            const res = await request(app)
                .post("/message/send")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    receiverId: receiverId,
                    content: "this is my message"
                });

            expect(res.status).toBe(403);
            expect(res.body.message).toBe("Cannot send message to user you are not following");
        });
        it("Should return 400 if receiverId is missing", async () => {
            const currentUserId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: currentUserId,
                    email: "current@example.com",
                    username: "currentUser"
                });

            const res = await request(app)
                .post("/message/send")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    // Missing receiverId
                    content: "this is my message"
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Receiver ID is required");
        });

        it("Should return 400 if content is empty", async () => {
            const currentUserId = new Types.ObjectId().toString();
            const receiverId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: currentUserId,
                    email: "current@example.com",
                    username: "currentUser"
                });

            // Mock User.findById to return a user with following array
            const mockUser = {
                _id: new Types.ObjectId(currentUserId),
                username: "currentUser",
                email: "current@example.com",
                following: [new Types.ObjectId(receiverId)]
            };

            const userFindByIdMock = jest.spyOn(User, 'findById')
                .mockResolvedValue(mockUser as any);

            const res = await request(app)
                .post("/message/send")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    receiverId: receiverId,
                    content: "" // Empty content
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Validation failed");
            expect(res.body.errors).toBeDefined();
        });

        it("Should return 400 if content is too long", async () => {
            const currentUserId = new Types.ObjectId().toString();
            const receiverId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: currentUserId,
                    email: "current@example.com",
                    username: "currentUser"
                });

            // Mock User.findById to return a user with following array
            const mockUser = {
                _id: new Types.ObjectId(currentUserId),
                username: "currentUser",
                email: "current@example.com",
                following: [new Types.ObjectId(receiverId)]
            };

            const userFindByIdMock = jest.spyOn(User, 'findById')
                .mockResolvedValue(mockUser as any);

            const res = await request(app)
                .post("/message/send")
                .set('Cookie', 'auth-token=mock-jwt-token')
                .send({
                    receiverId: receiverId,
                    content: "a".repeat(1001) // Assuming max length is 1000 characters
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Validation failed");
            expect(res.body.errors).toBeDefined();
        });

    });
    describe("GET /messages/:id",()=>{
        it("should get messages between two users successfully", async () => {
            const currentUserId = new Types.ObjectId().toString();
            const otherUserId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: currentUserId,
                    email: "current@example.com",
                    username: "currentUser"
                });

            // Mock config
            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock messages between users
            const mockMessages = [
                {
                    _id: new Types.ObjectId(),
                    senderId: new Types.ObjectId(currentUserId),
                    receiverId: new Types.ObjectId(otherUserId),
                    content: 'Hello!',
                    createdAt: new Date('2024-01-01T10:00:00Z')
                },
                {
                    _id: new Types.ObjectId(),
                    senderId: new Types.ObjectId(otherUserId),
                    receiverId: new Types.ObjectId(currentUserId),
                    content: 'Hi there!',
                    createdAt: new Date('2024-01-01T10:05:00Z')
                },
                {
                    _id: new Types.ObjectId(),
                    senderId: new Types.ObjectId(currentUserId),
                    receiverId: new Types.ObjectId(otherUserId),
                    content: 'How are you?',
                    createdAt: new Date('2024-01-01T10:10:00Z')
                }
            ];

            // Mock Message.find with chaining methods
            const messageFindMock = jest.spyOn(Message, 'find')
                .mockReturnValue({
                    sort: jest.fn().mockResolvedValue(mockMessages)
                } as any);

            const res = await request(app)
                .get(`/message/messages/${otherUserId}`)
                .set('Cookie', 'auth-token=mock-jwt-token');

            // Assertions
            expect(res.status).toBe(200);
            expect(res.body.messages).toBeDefined();
            expect(res.body.count).toBe(3);
            expect(res.body.messages).toHaveLength(3);

            // Verify the message structure
            expect(res.body.messages[0]).toHaveProperty('_id');
            expect(res.body.messages[0]).toHaveProperty('text');
            expect(res.body.messages[0]).toHaveProperty('createdAt');
            expect(res.body.messages[0]).toHaveProperty('senderId');
            expect(res.body.messages[0]).toHaveProperty('receiverId');

            // Verify the mock was called with correct parameters
            expect(messageFindMock).toHaveBeenCalledWith({
                $or: [
                    {
                        senderId: new Types.ObjectId(currentUserId),
                        receiverId: new Types.ObjectId(otherUserId)
                    },
                    {
                        senderId: new Types.ObjectId(otherUserId),
                        receiverId: new Types.ObjectId(currentUserId)
                    }
                ]
            });
        });

        it("should return 401 if user is not authenticated", async () => {
            const otherUserId = new Types.ObjectId().toString();

            const res = await request(app)
                .get(`/message/messages/${otherUserId}`);

            expect(res.status).toBe(401);
        });

        it("should return 400 if receiver ID is missing", async () => {
            const currentUserId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: currentUserId,
                    email: "current@example.com",
                    username: "currentUser"
                });

            const res = await request(app)
                .get(`/message/messages/`) // Missing receiver ID
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(404); // Route not found
        });

        it("should return empty messages array if no messages exist between users", async () => {
            const currentUserId = new Types.ObjectId().toString();
            const otherUserId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: currentUserId,
                    email: "current@example.com",
                    username: "currentUser"
                });

            // Mock config
            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock empty messages array
            const messageFindMock = jest.spyOn(Message, 'find')
                .mockReturnValue({
                    sort: jest.fn().mockResolvedValue([])
                } as any);

            const res = await request(app)
                .get(`/message/messages/${otherUserId}`)
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(200);
            expect(res.body.messages).toEqual([]);
            expect(res.body.count).toBe(0);
        });

        it("should handle database errors gracefully", async () => {
            const currentUserId = new Types.ObjectId().toString();
            const otherUserId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: currentUserId,
                    email: "current@example.com",
                    username: "currentUser"
                });

            // Mock config
            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock database error
            const messageFindMock = jest.spyOn(Message, 'find')
                .mockReturnValue({
                    sort: jest.fn().mockRejectedValue(new Error('Error fetching messages'))
                } as any);

            const res = await request(app)
                .get(`/message/messages/${otherUserId}`)
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Error fetching messages');
        });

        it("should return messages sorted by creation time (oldest first)", async () => {
            const currentUserId = new Types.ObjectId().toString();
            const otherUserId = new Types.ObjectId().toString();

            // Mock JWT verification
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: currentUserId,
                    email: "current@example.com",
                    username: "currentUser"
                });

            // Mock config
            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock messages with specific order
            const mockMessages = [
                {
                    _id: new Types.ObjectId(),
                    senderId: new Types.ObjectId(currentUserId),
                    receiverId: new Types.ObjectId(otherUserId),
                    content: 'First message',
                    createdAt: new Date('2024-01-01T09:00:00Z')
                },
                {
                    _id: new Types.ObjectId(),
                    senderId: new Types.ObjectId(otherUserId),
                    receiverId: new Types.ObjectId(currentUserId),
                    content: 'Second message',
                    createdAt: new Date('2024-01-01T10:00:00Z')
                },
                {
                    _id: new Types.ObjectId(),
                    senderId: new Types.ObjectId(currentUserId),
                    receiverId: new Types.ObjectId(otherUserId),
                    content: 'Third message',
                    createdAt: new Date('2024-01-01T11:00:00Z')
                }
            ];

            const sortMock = jest.fn().mockResolvedValue(mockMessages);
            const messageFindMock = jest.spyOn(Message, 'find')
                .mockReturnValue({
                    sort: sortMock
                } as any);

            const res = await request(app)
                .get(`/message/messages/${otherUserId}`)
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(200);
            expect(sortMock).toHaveBeenCalledWith({ createdAt: 1 });
            expect(res.body.messages[0].text).toBe('First message');
            expect(res.body.messages[1].text).toBe('Second message');
            expect(res.body.messages[2].text).toBe('Third message');
        });
    });

});