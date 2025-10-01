import { Types } from 'mongoose';
import { Request, Response } from 'express';
import * as postController from '../../controllers/post';
import * as postService from '../../services/postService';

const userId = new Types.ObjectId().toString();

describe('Post Controller', () => {
  let res: Partial<Response>;
  let req: Partial<Request>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    res = { status: statusMock, json: jsonMock } as Partial<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post and return status 201', async () => {
      req = {
        user: { id: userId },
        body: { title: 'My Post', content: 'This is my post body' },
      };

      const mockPost = {
        _id: 'mockPostId',
        title: 'My Post',
        content: 'This is my post body',
        author_id: userId,
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(postService, 'createPost')
        .mockResolvedValue(
          mockPost as unknown as Awaited<
            ReturnType<typeof postService.createPost>
          >,
        );

      await postController.createPost(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Post created successfully',
        post: mockPost,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      req = { body: { title: 'Title', content: 'Body' } };

      await postController.createPost(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User not authenticated',
      });
    });

    it('should return 401 if validation fails', async () => {
      req = { user: { id: userId }, body: { title: '', content: '' } };

      jest.spyOn(postService, 'createPost').mockRejectedValue({
        status: 401,
        message: 'Validation failed',
        errors: [
          { field: 'title', message: 'Title is required' },
          { field: 'content', message: 'Content is required' },
        ],
      });

      await postController.createPost(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [
          { field: 'title', message: 'Title is required' },
          { field: 'content', message: 'Content is required' },
        ],
      });
    });

    it('should return 404 if user does not exist', async () => {
      req = {
        user: { id: userId },
        body: { title: 'Valid Title', content: 'Valid content' },
      };

      jest.spyOn(postService, 'createPost').mockRejectedValue({
        status: 404,
        message: "account doesn't exist",
      });

      await postController.createPost(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "account doesn't exist",
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      req = {
        user: { id: userId },
        body: { title: 'Some Title', content: 'Some Content' },
      };

      jest
        .spyOn(postService, 'createPost')
        .mockRejectedValue(new Error('Database error'));

      await postController.createPost(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });
  describe('getPosts', () => {
    it('should get all posts and return status 200', async () => {
      const mockPosts = [
        {
          _id: '1',
          title: 'First post',
          content: 'Hello world',
          author_id: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '2',
          title: 'Second post',
          content: 'Another one',
          author_id: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest
        .spyOn(postService, 'getAllPosts')
        .mockResolvedValue(
          mockPosts as unknown as Awaited<
            ReturnType<typeof postService.getAllPosts>
          >,
        );

      await postController.getPosts(req as Request, res as Response);

      expect(postService.getAllPosts).toHaveBeenCalledTimes(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockPosts);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(postService, 'getAllPosts')
        .mockRejectedValue(new Error('Database error'));

      await postController.getPosts(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });

    it('should return custom status and message if AppError is thrown', async () => {
      jest.spyOn(postService, 'getAllPosts').mockRejectedValue({
        status: 400,
        message: 'Bad Request',
      });

      await postController.getPosts(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Bad Request',
      });
    });
  });
  describe('deletePost', () => {
    it('should delete a post and return status 200', async () => {
      req = { params: { id: 'mockPostId' } };

      const mockDeletedPost = {
        _id: 'mockPostId',
        title: 'Some Post',
        content: 'Some Content',
        author_id: userId,
      };

      jest
        .spyOn(postService, 'deletePost')
        .mockResolvedValue(
          mockDeletedPost as unknown as Awaited<
            ReturnType<typeof postService.deletePost>
          >,
        );

      await postController.deletePost(req as Request, res as Response);

      expect(postService.deletePost).toHaveBeenCalledWith('mockPostId');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Post deleted successfully',
        post: mockDeletedPost,
      });
    });

    it('should return 404 if post not found', async () => {
      req = { params: { id: 'nonExistentPostId' } };

      jest.spyOn(postService, 'deletePost').mockRejectedValue({
        status: 404,
        message: 'Post not found',
      });

      await postController.deletePost(req as Request, res as Response);

      expect(postService.deletePost).toHaveBeenCalledWith('nonExistentPostId');
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Post not found',
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      req = { params: { id: 'mockPostId' } };

      jest
        .spyOn(postService, 'deletePost')
        .mockRejectedValue(new Error('Database error'));

      await postController.deletePost(req as Request, res as Response);

      expect(postService.deletePost).toHaveBeenCalledWith('mockPostId');
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });

    it('should return custom status and message if AppError is thrown', async () => {
      req = { params: { id: 'mockPostId' } };

      jest.spyOn(postService, 'deletePost').mockRejectedValue({
        status: 400,
        message: 'Bad Request',
      });

      await postController.deletePost(req as Request, res as Response);

      expect(postService.deletePost).toHaveBeenCalledWith('mockPostId');
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Bad Request',
      });
    });
  });
  describe('updatePost', () => {
    it('should update a post and return status 200', async () => {
      req = {
        params: { id: 'mockPostId' },
        body: { title: 'Updated Title', content: 'Updated Content' },
      };

      const mockUpdatedPost = {
        _id: 'mockPostId',
        title: 'Updated Title',
        content: 'Updated Content',
        author_id: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(postService, 'updatePost')
        .mockResolvedValue(
          mockUpdatedPost as unknown as Awaited<
            ReturnType<typeof postService.updatePost>
          >,
        );

      await postController.updatePost(req as Request, res as Response);

      expect(postService.updatePost).toHaveBeenCalledWith(
        'mockPostId',
        req.body,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Post updated successfully',
        post: mockUpdatedPost,
      });
    });

    it('should return 404 if post not found', async () => {
      req = {
        params: { id: 'nonExistentPostId' },
        body: { title: 'Some Title' },
      };

      jest.spyOn(postService, 'updatePost').mockRejectedValue({
        status: 404,
        message: 'Post not found',
      });

      await postController.updatePost(req as Request, res as Response);

      expect(postService.updatePost).toHaveBeenCalledWith(
        'nonExistentPostId',
        req.body,
      );
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Post not found',
      });
    });

    it('should return 400 if validation fails', async () => {
      req = { params: { id: 'mockPostId' }, body: { title: '' } };

      jest.spyOn(postService, 'updatePost').mockRejectedValue({
        status: 400,
        message: 'Validation failed',
        errors: [{ field: 'title', message: 'Title is required' }],
      });

      await postController.updatePost(req as Request, res as Response);

      expect(postService.updatePost).toHaveBeenCalledWith(
        'mockPostId',
        req.body,
      );
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [{ field: 'title', message: 'Title is required' }],
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      req = { params: { id: 'mockPostId' }, body: { title: 'Crash Title' } };

      jest
        .spyOn(postService, 'updatePost')
        .mockRejectedValue(new Error('Database error'));

      await postController.updatePost(req as Request, res as Response);

      expect(postService.updatePost).toHaveBeenCalledWith(
        'mockPostId',
        req.body,
      );
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });

  describe('likePost', () => {
    it("should like a post and return status 200 with 'Post liked'", async () => {
      req = { params: { id: 'mockPostId' }, user: { id: userId } };

      jest.spyOn(postService, 'likePost').mockResolvedValue({
        alreadyLiked: false,
        likes: [
          {
            user: new Types.ObjectId('507f1f77bcf86cd799439011'),
            createdAt: new Date(),
          },
          {
            user: new Types.ObjectId('507f1f77bcf86cd799439012'),
            createdAt: new Date(),
          },
          { user: new Types.ObjectId(userId), createdAt: new Date() },
        ],
      });

      await postController.likePost(req as Request, res as Response);

      expect(postService.likePost).toHaveBeenCalledWith('mockPostId', userId);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Post liked',
        likes: [
          { user: expect.any(Types.ObjectId), createdAt: expect.any(Date) },
          { user: expect.any(Types.ObjectId), createdAt: expect.any(Date) },
          { user: expect.any(Types.ObjectId), createdAt: expect.any(Date) },
        ],
      });
    });

    it("should unlike a post and return status 200 with 'Post unliked'", async () => {
      req = { params: { id: 'mockPostId' }, user: { id: userId } };

      jest.spyOn(postService, 'likePost').mockResolvedValue({
        alreadyLiked: true,
        likes: [
          {
            user: new Types.ObjectId('507f1f77bcf86cd799439011'),
            createdAt: new Date(),
          },
          {
            user: new Types.ObjectId('507f1f77bcf86cd799439012'),
            createdAt: new Date(),
          },
        ],
      });

      await postController.likePost(req as Request, res as Response);

      expect(postService.likePost).toHaveBeenCalledWith('mockPostId', userId);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Post unliked',
        likes: [
          { user: expect.any(Types.ObjectId), createdAt: expect.any(Date) },
          { user: expect.any(Types.ObjectId), createdAt: expect.any(Date) },
        ],
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      req = { params: { id: 'mockPostId' } }; // no user

      await postController.likePost(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User not authenticated',
      });
    });

    it('should return 404 if post not found', async () => {
      req = { params: { id: 'nonExistentPostId' }, user: { id: userId } };

      jest.spyOn(postService, 'likePost').mockRejectedValue({
        status: 404,
        message: 'Post not found',
      });

      await postController.likePost(req as Request, res as Response);

      expect(postService.likePost).toHaveBeenCalledWith(
        'nonExistentPostId',
        userId,
      );
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Post not found',
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      req = { params: { id: 'mockPostId' }, user: { id: userId } };

      jest
        .spyOn(postService, 'likePost')
        .mockRejectedValue(new Error('Database error'));

      await postController.likePost(req as Request, res as Response);

      expect(postService.likePost).toHaveBeenCalledWith('mockPostId', userId);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });
  });
  describe('getCommentsByPostIdArray', () => {
    it('should return comments for a valid postId and status 200', async () => {
      req = { params: { id: 'mockPostId' } };

      const mockComments = [
        {
          _id: 'comment1',
          text: 'First comment',
          user: { _id: 'user1', name: 'Alice', email: 'alice@test.com' },
          createdAt: new Date(),
        },
        {
          _id: 'comment2',
          text: 'Second comment',
          user: { _id: 'user2', name: 'Bob', email: 'bob@test.com' },
          createdAt: new Date(),
        },
      ];

      jest
        .spyOn(postService, 'getCommentsByPostId')
        .mockResolvedValue(
          mockComments as unknown as Awaited<
            ReturnType<typeof postService.getCommentsByPostId>
          >,
        );

      await postController.getCommentsByPostIdArray(
        req as Request,
        res as Response,
      );

      expect(postService.getCommentsByPostId).toHaveBeenCalledWith(
        'mockPostId',
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ comments: mockComments });
    });

    it('should return 404 if post is not found', async () => {
      req = { params: { id: 'nonExistentPostId' } };

      jest.spyOn(postService, 'getCommentsByPostId').mockRejectedValue({
        status: 404,
        message: 'Post not found',
      });

      await postController.getCommentsByPostIdArray(
        req as Request,
        res as Response,
      );

      expect(postService.getCommentsByPostId).toHaveBeenCalledWith(
        'nonExistentPostId',
      );
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Post not found',
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      req = { params: { id: 'mockPostId' } };

      jest
        .spyOn(postService, 'getCommentsByPostId')
        .mockRejectedValue(new Error('Database error'));

      await postController.getCommentsByPostIdArray(
        req as Request,
        res as Response,
      );

      expect(postService.getCommentsByPostId).toHaveBeenCalledWith(
        'mockPostId',
      );
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });

    it('should handle AppError with custom status and message', async () => {
      req = { params: { id: 'mockPostId' } };

      jest.spyOn(postService, 'getCommentsByPostId').mockRejectedValue({
        status: 400,
        message: 'Bad Request',
      });

      await postController.getCommentsByPostIdArray(
        req as Request,
        res as Response,
      );

      expect(postService.getCommentsByPostId).toHaveBeenCalledWith(
        'mockPostId',
      );
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Bad Request',
      });
    });
  });
});
