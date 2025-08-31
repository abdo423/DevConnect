import User  from "../../models/user";
import Message,{validateMessageInput} from "../../models/message";
import * as messageService from "../../services/messageService"
import mongoose, { Types } from "mongoose";

jest.mock("../../models/message");
jest.mock("../../models/user");


// Fake ObjectIds
export const senderId = new Types.ObjectId().toString();
export const receiverId = new Types.ObjectId().toString();
export const currentUserId = new Types.ObjectId().toString();

export const mockUser = {
    _id: senderId,
    username: "testuser",
    email: "test@example.com",
    avatar: "avatar.jpg",
    following: [new Types.ObjectId(receiverId)], // sender follows receiver
};

export const mockReceiver = {
    _id: receiverId,
    username: "receiverUser",
    email: "receiver@example.com",
    avatar: "receiverAvatar.jpg",
    following: [],
};

export const mockMessageDoc = {
    _id: new Types.ObjectId(),
    senderId: new Types.ObjectId(senderId),
    receiverId: new Types.ObjectId(receiverId),
    content: "Hello there!",
    createdAt: new Date(),
    save: jest.fn().mockResolvedValue(true), // so service.save() works
};
export const mockMessageReturn = {
    _id: mockMessageDoc._id,
    text: mockMessageDoc.content,
    createdAt: mockMessageDoc.createdAt,
    senderId: senderId,
    receiverId: receiverId,
};

describe("Message Service", () => {
    afterAll(async () => {
        jest.resetAllMocks();
    });
    describe("messageService.createMessageService", () => {
        it("message sent successfully", async () => {
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (Message as unknown as jest.Mock).mockImplementation(() => mockMessageDoc);
            (validateMessageInput  as jest.Mock).mockReturnValue({ success: true });

            const result = await messageService.createMessageService(senderId, receiverId, "Hello there!");

            expect(result).toEqual(mockMessageReturn);
            expect(Message).toHaveBeenCalledWith(
                expect.objectContaining({
                    senderId: expect.any(Object),
                    receiverId: expect.any(Object),
                    content: "Hello there!",
                })
            );
            expect(mockMessageDoc.save).toHaveBeenCalled();
        });
        it("should throw if senderId is missing", async () => {
            await expect(messageService.createMessageService("", receiverId, "Hello")).rejects.toEqual({
                status: 401,
                message: "User not authenticated",
            });
        });

        it("should throw if user not found", async () => {
            (User.findById as jest.Mock).mockResolvedValue(null);

            await expect(messageService.createMessageService(senderId, receiverId, "Hello")).rejects.toEqual({
                status: 404,
                message: "User not found",
            });
        });

        it("should throw if receiverId is missing", async () => {
            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            await expect(messageService.createMessageService(senderId, "", "Hello")).rejects.toEqual({
                status: 400,
                message: "Receiver ID is required",
            });
        });

        it("should throw if sender does not follow receiver", async () => {
            const userNotFollowing = {...mockUser, following: []};
            (User.findById as jest.Mock).mockResolvedValue(userNotFollowing);

            await expect(messageService.createMessageService(senderId, receiverId, "Hello")).rejects.toEqual({
                status: 403,
                message: "Cannot send message to user you are not following",
            });
        });

        it("should throw if validation fails", async () => {
            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            // mock validation to fail
            jest.spyOn(require("../../models/message"), "validateMessageInput").mockReturnValue({
                success: false,
                error: {errors: [{message: "Content is required"}]},
            });

            await expect(messageService.createMessageService(senderId, receiverId, "")).rejects.toMatchObject({
                status: 400,
                message: "Validation failed",
            });
        });

    });

    describe("messageService.getMessagesBetweenUsersService", () => {

        it("should throw 401 if senderId is missing", async () => {
            await expect(
                messageService.getMessagesBetweenUsersService("", receiverId)
            ).rejects.toEqual({ status: 401, message: "User not authenticated" });
        });

        it("should throw 400 if receiverId is missing", async () => {
            await expect(
                messageService.getMessagesBetweenUsersService(senderId, "")
            ).rejects.toEqual({ status: 400, message: "Receiver ID is required" });
        });

        it("should return messages sorted by createdAt", async () => {
            const mockMessages = [
                {
                    _id: new Types.ObjectId(),
                    content: "Hello",
                    createdAt: new Date("2025-01-01T10:00:00Z"),
                    senderId: new Types.ObjectId(senderId),
                    receiverId: new Types.ObjectId(receiverId),
                },
                {
                    _id: new Types.ObjectId(),
                    content: "Hi there",
                    createdAt: new Date("2025-01-01T11:00:00Z"),
                    senderId: new Types.ObjectId(receiverId),
                    receiverId: new Types.ObjectId(senderId),
                },
            ];

            // Mock Message.find().sort()
            (Message.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockMessages),
            });

            const result = await messageService.getMessagesBetweenUsersService(senderId, receiverId);

            expect(Message.find).toHaveBeenCalledWith({
                $or: [
                    { senderId: new Types.ObjectId(senderId), receiverId: new Types.ObjectId(receiverId) },
                    { senderId: new Types.ObjectId(receiverId), receiverId: new Types.ObjectId(senderId) },
                ],
            });

            expect(result).toEqual([
                {
                    _id: mockMessages[0]._id,
                    text: "Hello",
                    createdAt: mockMessages[0].createdAt,
                    senderId: mockMessages[0].senderId.toString(),
                    receiverId: mockMessages[0].receiverId.toString(),
                },
                {
                    _id: mockMessages[1]._id,
                    text: "Hi there",
                    createdAt: mockMessages[1].createdAt,
                    senderId: mockMessages[1].senderId.toString(),
                    receiverId: mockMessages[1].receiverId.toString(),
                },
            ]);
        });

        it("should return an empty array if no messages found", async () => {
            (Message.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
            });

            const result = await messageService.getMessagesBetweenUsersService(senderId, receiverId);

            expect(result).toEqual([]);
        });
    });
    describe("messageService.getSendersForCurrentUserService", () => {
        it("should throw 401 if currentId is missing", async () => {
            await expect(
                messageService.getSendersForCurrentUserService("")
            ).rejects.toEqual({ status: 401, message: "User not authenticated" });
        });

        it("should return unique senders for the current user", async () => {
            const mockSenders = [
                {
                    _id: new Types.ObjectId(),
                    username: "sender1",
                    avatar: "avatar1.jpg",
                },
                {
                    _id: new Types.ObjectId(),
                    username: "sender2",
                    avatar: "avatar2.jpg",
                },
            ];

            (Message.aggregate as jest.Mock).mockResolvedValue(mockSenders);

            const result = await messageService.getSendersForCurrentUserService(currentUserId);

            expect(Message.aggregate).toHaveBeenCalledWith([
                { $match: { receiverId: new Types.ObjectId(currentUserId) } },
                { $group: { _id: "$senderId" } },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "sender",
                    },
                },
                { $unwind: "$sender" },
                {
                    $project: {
                        _id: "$sender._id",
                        username: "$sender.username",
                        avatar: "$sender.avatar",
                    },
                },
            ]);

            expect(result).toEqual(mockSenders);
        });

        it("should return an empty array if no senders found", async () => {
            (Message.aggregate as jest.Mock).mockResolvedValue([]);

            const result = await messageService.getSendersForCurrentUserService(currentUserId);

            expect(result).toEqual([]);
        });
    });

})