import {Types} from "mongoose";
import Comment, {validateComment, validateCommentInput} from "../../models/comment";
import * as commentService from "../../services/commentService"

jest.mock("../../models/comment");
// Mock the Comment constructor and its methods
const mockSave = jest.fn();
const mockPopulate = jest.fn();

// Create a mock Comment class
const mockComment = {
    save: jest.fn(),
    populate: jest.fn()
};


describe("Comment Service", () => {
    afterAll(async () => {
        jest.clearAllMocks();
    })
    const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId format
    const postId = "507f1f77bcf86cd799439012";   // Valid ObjectId format

    const mockCommentData = {
        user: new Types.ObjectId(userId),
        post: new Types.ObjectId(postId),
        content: "this is a comment",
        likes: [],
        createdAt: expect.any(Date)
    };

    const mockPopulatedComment = {
        ...mockCommentData,
        user: {
            _id: userId,
            username: "testuser",
            avatar: "avatar.jpg"
        }
    };
    describe("createComment", () => {
      it("Should return a new comment", async () => {
          // Mock validateCommentInput to return success
          (validateCommentInput as jest.Mock).mockReturnValue({
              success: true,
              data: { post: postId, content: "this is a comment" }
          });

          // Mock validateComment to return success
          (validateComment as jest.Mock).mockReturnValue({
              success: true,
              data: mockCommentData
          });
          (Comment as unknown as jest.Mock).mockImplementation(() => mockComment);

          mockSave.mockResolvedValue(mockCommentData);

          mockPopulate.mockResolvedValue(mockPopulatedComment);

          const result = await commentService.createComment(userId, postId, "this is a comment");

          // Assertions
          expect(validateCommentInput).toHaveBeenCalledWith({
              post: postId,
              content: "this is a comment"
          });

          expect(validateComment).toHaveBeenCalledWith(
              expect.objectContaining({
                  user: expect.any(Types.ObjectId),
                  post: expect.any(Types.ObjectId),
                  content: "this is a comment",
                  likes: [],
                  createdAt: expect.any(Date)
              })
          );

          expect(mockComment).toHaveBeenCalledWith(
              expect.objectContaining({
                  user: expect.any(Types.ObjectId),
                  post: expect.any(Types.ObjectId),
                  content: "this is a comment",
                  likes: [],
                  createdAt: expect.any(Date)
              })
          );

          expect(mockSave).toHaveBeenCalled();
          expect(mockPopulate).toHaveBeenCalledWith('user', 'username avatar');

          // The function returns the populated comment, not wrapped in an object
          expect(result).toEqual(mockPopulatedComment);

      })
    })
})