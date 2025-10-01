import request from 'supertest';
import { Types } from 'mongoose';
import app from '../../app'; // Adjust path as needed
import Post from '../../models/post'; // Adjust path as needed
import User from '../../models/user'; // Adjust path as needed
const postModule = require('../../models/post');
import Comment from '../../models/comment';
// Mock the models
jest.mock('../../models/post');
jest.mock('../../models/user');
jest.mock('../../models/comment');

describe('POST /post/create', () => {
  let currentUserId: string;
  let mockJwtVerify: jest.SpyInstance;
  let mockConfigGet: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up current user ID for each test
    currentUserId = new Types.ObjectId().toString();

    // Mock JWT verification - returns authenticated user
    mockJwtVerify = jest
      .spyOn(require('jsonwebtoken'), 'verify')
      .mockReturnValue({
        id: currentUserId,
        email: 'current@example.com',
        username: 'currentUser',
      });

    // Mock config
    mockConfigGet = jest
      .spyOn(require('config'), 'get')
      .mockReturnValue('test-secret');
  });

  it('should create post successfully', async () => {
    const postBody = {
      title: 'Test Post',
      content: 'This is a test post content',
      tags: ['test', 'sample'],
    };

    // Mock validation
    jest
      .spyOn(postModule, 'validatePost')
      .mockReturnValue({ success: true, data: {} });

    const mockSavedPost = {
      _id: new Types.ObjectId(),
      ...postBody,
      author_id: new Types.ObjectId(currentUserId),
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
    };

    const mockPopulatedPost = {
      ...mockSavedPost,
      author_id: {
        _id: new Types.ObjectId(currentUserId),
        username: 'testUser',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.jpg',
      },
      comments: [],
    };

    const mockUser = {
      _id: new Types.ObjectId(currentUserId),
      username: 'testUser',
      posts: [],
    };

    // Mock Post constructor and save
    (Post as jest.MockedClass<typeof Post>).mockImplementation(
      () => mockSavedPost as any,
    );

    // Mock findById with populate chain
    const mockPopulateComments = jest.fn().mockResolvedValue(mockPopulatedPost);
    const mockPopulateAuthor = jest.fn().mockReturnValue({
      populate: mockPopulateComments,
    });
    (Post.findById as jest.Mock).mockReturnValue({
      populate: mockPopulateAuthor,
    });

    // Mock User findById and update
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      ...mockUser,
      posts: [mockSavedPost._id],
    });

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Post created successfully');
    expect(res.body.post.title).toBe(postBody.title);
    expect(res.body.post.content).toBe(postBody.content);
    expect(mockPopulateAuthor).toHaveBeenCalledWith(
      'author_id',
      'username email avatar',
    );
    expect(mockPopulateComments).toHaveBeenCalledWith(
      'comments',
      'content createdAt',
    );
  });

  it('should return 401 if user is not authenticated', async () => {
    const postBody = {
      title: 'Test Post',
      content: 'This is a test post content',
    };
    const res = await request(app)
      .post('/post/create')
      // No auth token
      .send(postBody);
    console.log(res.body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized access, please log in');
  });

  it('should return 400 if validation fails - missing title', async () => {
    const postBody = {
      content: 'This is a test post content',
      // Missing title
    };

    jest.spyOn(postModule, 'validatePost').mockReturnValue({
      success: false,
      error: {
        errors: {
          title: 'Title is required',
        },
      },
    });

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual({ title: 'Title is required' });
  });

  it('should return 400 if validation fails - missing content', async () => {
    const postBody = {
      title: 'Test Post',
      // Missing content
    };

    jest.spyOn(postModule, 'validatePost').mockReturnValue({
      success: false,
      error: {
        errors: {
          content: 'Content is required',
        },
      },
    });

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual({ content: 'Content is required' });
  });

  it('should return 400 if validation fails - title too short', async () => {
    const postBody = {
      title: 'Te',
      content: 'This is a test post content',
    };

    jest.spyOn(postModule, 'validatePost').mockReturnValue({
      success: false,
      error: {
        errors: {
          title: 'Title must be at least 3 characters',
        },
      },
    });

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual({
      title: 'Title must be at least 3 characters',
    });
  });

  it('should return 400 if validation fails - content too short', async () => {
    const postBody = {
      title: 'Test Post',
      content: 'Short',
    };

    jest.spyOn(postModule, 'validatePost').mockReturnValue({
      success: false,
      error: {
        errors: {
          content: 'Content must be at least 10 characters',
        },
      },
    });

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual({
      content: 'Content must be at least 10 characters',
    });
  });

  it('should return 400 if validation fails - multiple errors', async () => {
    const postBody = {
      title: 'Te',
      content: 'Short',
    };

    jest.spyOn(postModule, 'validatePost').mockReturnValue({
      success: false,
      error: {
        errors: {
          title: 'Title must be at least 3 characters',
          content: 'Content must be at least 10 characters',
        },
      },
    });

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual({
      title: 'Title must be at least 3 characters',
      content: 'Content must be at least 10 characters',
    });
  });

  it('should return 404 if user account does not exist', async () => {
    const postBody = {
      title: 'Test Post',
      content: 'This is a test post content',
    };

    jest
      .spyOn(postModule, 'validatePost')
      .mockReturnValue({ success: true, data: {} });

    const mockSavedPost = {
      _id: new Types.ObjectId(),
      ...postBody,
      author_id: new Types.ObjectId(currentUserId),
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
    };

    (Post as jest.MockedClass<typeof Post>).mockImplementation(
      () => mockSavedPost as any,
    );

    const mockPopulateComments = jest.fn().mockResolvedValue(mockSavedPost);
    const mockPopulateAuthor = jest.fn().mockReturnValue({
      populate: mockPopulateComments,
    });
    (Post.findById as jest.Mock).mockReturnValue({
      populate: mockPopulateAuthor,
    });

    // User not found
    (User.findById as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("account doesn't exist");
  });

  it('should return 500 if post save fails', async () => {
    const postBody = {
      title: 'Test Post',
      content: 'This is a test post content',
    };

    jest
      .spyOn(postModule, 'validatePost')
      .mockReturnValue({ success: true, data: {} });

    const mockSavedPost = {
      _id: new Types.ObjectId(),
      save: jest.fn().mockRejectedValue(new Error('Database save error')),
    };

    (Post as jest.MockedClass<typeof Post>).mockImplementation(
      () => mockSavedPost as any,
    );

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Database save error');
  });

  it('should return 500 if user update fails', async () => {
    const postBody = {
      title: 'Test Post',
      content: 'This is a test post content',
    };

    jest
      .spyOn(postModule, 'validatePost')
      .mockReturnValue({ success: true, data: {} });

    const mockSavedPost = {
      _id: new Types.ObjectId(),
      ...postBody,
      author_id: new Types.ObjectId(currentUserId),
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
    };

    const mockUser = {
      _id: new Types.ObjectId(currentUserId),
      username: 'testUser',
      posts: [],
    };

    (Post as jest.MockedClass<typeof Post>).mockImplementation(
      () => mockSavedPost as any,
    );

    const mockPopulateComments = jest.fn().mockResolvedValue(mockSavedPost);
    const mockPopulateAuthor = jest.fn().mockReturnValue({
      populate: mockPopulateComments,
    });
    (Post.findById as jest.Mock).mockReturnValue({
      populate: mockPopulateAuthor,
    });

    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockRejectedValue(
      new Error('User update failed'),
    );

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('User update failed');
  });

  it('should create post with tags successfully', async () => {
    const postBody = {
      title: 'Test Post',
      content: 'This is a test post content',
      tags: ['javascript', 'nodejs', 'testing'],
    };

    jest
      .spyOn(postModule, 'validatePost')
      .mockReturnValue({ success: true, data: {} });

    const mockSavedPost = {
      _id: new Types.ObjectId(),
      ...postBody,
      author_id: new Types.ObjectId(currentUserId),
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
    };

    const mockPopulatedPost = {
      ...mockSavedPost,
      author_id: {
        _id: new Types.ObjectId(currentUserId),
        username: 'testUser',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.jpg',
      },
    };

    const mockUser = {
      _id: new Types.ObjectId(currentUserId),
      username: 'testUser',
      posts: [],
    };

    (Post as jest.MockedClass<typeof Post>).mockImplementation(
      () => mockSavedPost as any,
    );

    const mockPopulateComments = jest.fn().mockResolvedValue(mockPopulatedPost);
    const mockPopulateAuthor = jest.fn().mockReturnValue({
      populate: mockPopulateComments,
    });
    (Post.findById as jest.Mock).mockReturnValue({
      populate: mockPopulateAuthor,
    });

    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      ...mockUser,
      posts: [mockSavedPost._id],
    });

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Post created successfully');
    expect(res.body.post.tags).toEqual(postBody.tags);
  });

  it("should update user's posts array correctly", async () => {
    const postBody = {
      title: 'Test Post',
      content: 'This is a test post content',
    };

    jest
      .spyOn(postModule, 'validatePost')
      .mockReturnValue({ success: true, data: {} });

    const mockSavedPost = {
      _id: new Types.ObjectId(),
      id: new Types.ObjectId().toString(),
      ...postBody,
      author_id: new Types.ObjectId(currentUserId),
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
    };

    const mockPopulatedPost = {
      ...mockSavedPost,
      author_id: {
        _id: new Types.ObjectId(currentUserId),
        username: 'testUser',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.jpg',
      },
    };

    const mockUser = {
      _id: new Types.ObjectId(currentUserId),
      username: 'testUser',
      posts: [],
    };

    (Post as jest.MockedClass<typeof Post>).mockImplementation(
      () => mockSavedPost as any,
    );

    const mockPopulateComments = jest.fn().mockResolvedValue(mockPopulatedPost);
    const mockPopulateAuthor = jest.fn().mockReturnValue({
      populate: mockPopulateComments,
    });
    (Post.findById as jest.Mock).mockReturnValue({
      populate: mockPopulateAuthor,
    });

    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      ...mockUser,
      posts: [mockSavedPost.id],
    });

    const res = await request(app)
      .post('/post/create')
      .set('Cookie', 'auth-token=mock-jwt-token')
      .send(postBody);

    expect(res.status).toBe(201);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      currentUserId,
      { $push: { posts: mockSavedPost.id } },
      { new: true },
    );
  });
  // Add these test suites to your existing post.int.test.ts file

  describe('GET /post/all', () => {
    let mockJwtVerify: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      const currentUserId = new Types.ObjectId().toString();

      mockJwtVerify = jest
        .spyOn(require('jsonwebtoken'), 'verify')
        .mockReturnValue({
          id: currentUserId,
          email: 'current@example.com',
          username: 'currentUser',
        });

      jest.spyOn(require('config'), 'get').mockReturnValue('test-secret');
    });

    it('should get all posts successfully', async () => {
      const mockPosts = [
        {
          _id: new Types.ObjectId(),
          title: 'Post 1',
          content: 'Content 1',
          author_id: {
            _id: new Types.ObjectId(),
            name: 'User 1',
            email: 'user1@example.com',
            avatar: 'avatar1.jpg',
            username: 'user1',
          },
          comments: [],
          likes: [],
          createdAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          title: 'Post 2',
          content: 'Content 2',
          author_id: {
            _id: new Types.ObjectId(),
            name: 'User 2',
            email: 'user2@example.com',
            avatar: 'avatar2.jpg',
            username: 'user2',
          },
          comments: [],
          likes: [],
          createdAt: new Date(),
        },
      ];

      const mockPopulate = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPosts),
      });
      const mockSort = jest.fn().mockReturnValue({
        populate: mockPopulate,
      });
      (Post.find as jest.Mock).mockReturnValue({
        sort: mockSort,
      });

      const res = await request(app)
        .get('/post/all')
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should return 500 if database query fails', async () => {
      const mockSort = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      });
      (Post.find as jest.Mock).mockReturnValue({
        sort: mockSort,
      });

      const res = await request(app)
        .get('/post/all')
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('DELETE /post/delete/:id', () => {
    let currentUserId: string;
    let mockJwtVerify: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      currentUserId = new Types.ObjectId().toString();

      mockJwtVerify = jest
        .spyOn(require('jsonwebtoken'), 'verify')
        .mockReturnValue({
          id: currentUserId,
          email: 'current@example.com',
          username: 'currentUser',
        });

      jest.spyOn(require('config'), 'get').mockReturnValue('test-secret');
    });

    it('should delete post successfully', async () => {
      const postId = new Types.ObjectId().toString();
      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Test Post',
        content: 'Test Content',
        author_id: new Types.ObjectId(currentUserId),
      };

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);
      (Post.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const res = await request(app)
        .delete(`/post/delete/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post deleted successfully');
      expect(res.body.post).toBeDefined();
      expect(Post.deleteOne).toHaveBeenCalledWith({ _id: postId });
    });

    it('should return 404 if post does not exist', async () => {
      const postId = new Types.ObjectId().toString();

      (Post.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete(`/post/delete/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found');
    });

    it('should return 500 if delete operation fails', async () => {
      const postId = new Types.ObjectId().toString();
      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Test Post',
      };

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);
      (Post.deleteOne as jest.Mock).mockRejectedValue(
        new Error('Delete failed'),
      );

      const res = await request(app)
        .delete(`/post/delete/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Delete failed');
    });
  });

  describe('PATCH /post/update/:id', () => {
    let currentUserId: string;
    let mockJwtVerify: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      currentUserId = new Types.ObjectId().toString();

      mockJwtVerify = jest
        .spyOn(require('jsonwebtoken'), 'verify')
        .mockReturnValue({
          id: currentUserId,
          email: 'current@example.com',
          username: 'currentUser',
        });

      jest.spyOn(require('config'), 'get').mockReturnValue('test-secret');
    });

    it('should update post successfully', async () => {
      const postId = new Types.ObjectId().toString();
      const updateBody = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Old Title',
        content: 'Old Content',
        author_id: new Types.ObjectId(currentUserId),
        likes: [],
        comments: [],
        createdAt: new Date(),
        image: null,
      };

      const mockUpdatedPost = {
        ...mockPost,
        title: updateBody.title,
        content: updateBody.content,
        updatedAt: new Date(),
      };

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);

      jest
        .spyOn(require('../../models/post'), 'validateUpdatePost')
        .mockReturnValue({ success: true });

      (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

      const res = await request(app)
        .patch(`/post/update/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post updated successfully');
      expect(res.body.post.title).toBe(updateBody.title);
      expect(res.body.post.content).toBe(updateBody.content);
    });

    it('should return 404 if post does not exist', async () => {
      const postId = new Types.ObjectId().toString();
      const updateBody = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      (Post.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch(`/post/update/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found');
    });

    it('should return 400 if validation fails', async () => {
      const postId = new Types.ObjectId().toString();
      const updateBody = {
        title: 'Up',
        content: 'Short',
      };

      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Old Title',
        content: 'Old Content',
        author_id: new Types.ObjectId(currentUserId),
        likes: [],
        comments: [],
        createdAt: new Date(),
      };

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);

      jest
        .spyOn(require('../../models/post'), 'validateUpdatePost')
        .mockReturnValue({
          success: false,
          error: {
            errors: {
              title: 'Title must be at least 3 characters',
              content: 'Content must be at least 10 characters',
            },
          },
        });

      const res = await request(app)
        .patch(`/post/update/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toBeDefined();
    });

    it('should preserve existing data when partial update', async () => {
      const postId = new Types.ObjectId().toString();
      const updateBody = {
        title: 'Updated Title Only',
      };

      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Old Title',
        content: 'Old Content',
        author_id: new Types.ObjectId(currentUserId),
        likes: [],
        comments: [],
        createdAt: new Date(),
        image: 'old-image.jpg',
      };

      const mockUpdatedPost = {
        ...mockPost,
        title: updateBody.title,
        updatedAt: new Date(),
      };

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);

      jest
        .spyOn(require('../../models/post'), 'validateUpdatePost')
        .mockReturnValue({ success: true });

      (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

      const res = await request(app)
        .patch(`/post/update/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(200);
      expect(res.body.post.title).toBe(updateBody.title);
      expect(res.body.post.content).toBe(mockPost.content);
      expect(res.body.post.image).toBe(mockPost.image);
    });
  });

  describe('POST /post/like/:id', () => {
    let currentUserId: string;
    let mockJwtVerify: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      currentUserId = new Types.ObjectId().toString();

      mockJwtVerify = jest
        .spyOn(require('jsonwebtoken'), 'verify')
        .mockReturnValue({
          id: currentUserId,
          email: 'current@example.com',
          username: 'currentUser',
        });

      jest.spyOn(require('config'), 'get').mockReturnValue('test-secret');
    });

    it('should like post successfully', async () => {
      const postId = new Types.ObjectId().toString();
      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Test Post',
        likes: [],
        save: jest.fn().mockResolvedValue(true),
      };

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);

      const res = await request(app)
        .post(`/post/like/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post liked');
      expect(mockPost.save).toHaveBeenCalled();
    });

    it('should unlike post if already liked', async () => {
      const postId = new Types.ObjectId().toString();
      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Test Post',
        likes: [
          {
            user: new Types.ObjectId(currentUserId),
            createdAt: new Date(),
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);

      const res = await request(app)
        .post(`/post/like/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post unliked');
      expect(mockPost.save).toHaveBeenCalled();
    });

    it('should return 404 if post does not exist', async () => {
      const postId = new Types.ObjectId().toString();

      (Post.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post(`/post/like/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found');
    });

    it('should return 401 if user is not authenticated', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const postId = new Types.ObjectId().toString();

      const res = await request(app).post(`/post/like/${postId}`);

      expect(res.status).toBe(401);
    });

    it('should return 500 if save operation fails', async () => {
      const postId = new Types.ObjectId().toString();
      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Test Post',
        likes: [],
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
      };

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);

      const res = await request(app)
        .post(`/post/like/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Save failed');
    });
  });

  describe('GET /post/:id/comments', () => {
    let currentUserId: string;
    let mockJwtVerify: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      currentUserId = new Types.ObjectId().toString();

      mockJwtVerify = jest
        .spyOn(require('jsonwebtoken'), 'verify')
        .mockReturnValue({
          id: currentUserId,
          email: 'current@example.com',
          username: 'currentUser',
        });

      jest.spyOn(require('config'), 'get').mockReturnValue('test-secret');
    });

    it('should get comments by post id successfully', async () => {
      const postId = new Types.ObjectId().toString();
      const comment1Id = new Types.ObjectId();
      const comment2Id = new Types.ObjectId();

      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Test Post',
        comments: [comment1Id, comment2Id],
      };

      const mockComments = [
        {
          _id: comment1Id,
          content: 'Comment 1',
          user: {
            _id: new Types.ObjectId(),
            name: 'User 1',
            email: 'user1@example.com',
          },
          createdAt: new Date(),
        },
        {
          _id: comment2Id,
          content: 'Comment 2',
          user: {
            _id: new Types.ObjectId(),
            name: 'User 2',
            email: 'user2@example.com',
          },
          createdAt: new Date(),
        },
      ];

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);

      const mockSort = jest.fn().mockResolvedValue(mockComments);
      const mockPopulate = jest.fn().mockReturnValue({
        sort: mockSort,
      });
      (Comment.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      const res = await request(app)
        .get(`/post/comments/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.comments).toBeDefined();
      expect(Array.isArray(res.body.comments)).toBe(true);
      expect(res.body.comments.length).toBe(2);
    });

    it('should return 404 if post does not exist', async () => {
      const postId = new Types.ObjectId().toString();

      (Post.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get(`/post/comments/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found');
    });

    it('should return empty array if post has no comments', async () => {
      const postId = new Types.ObjectId().toString();

      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Test Post',
        comments: [],
      };

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);

      const mockSort = jest.fn().mockResolvedValue([]);
      const mockPopulate = jest.fn().mockReturnValue({
        sort: mockSort,
      });
      (Comment.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      const res = await request(app)
        .get(`/post/comments/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.comments).toBeDefined();
      expect(Array.isArray(res.body.comments)).toBe(true);
      expect(res.body.comments.length).toBe(0);
    });

    it('should return 500 if database query fails', async () => {
      const postId = new Types.ObjectId().toString();

      const mockPost = {
        _id: new Types.ObjectId(postId),
        title: 'Test Post',
        comments: [new Types.ObjectId()],
      };

      (Post.findById as jest.Mock).mockResolvedValue(mockPost);

      const mockPopulate = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      });
      (Comment.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      const res = await request(app)
        .get(`/post/comments/${postId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Database error');
    });
  });
});
