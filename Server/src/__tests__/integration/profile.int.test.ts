import request from 'supertest';
import { Types } from 'mongoose';
import app from '../../app';
import User from '../../models/user';
import Post from '../../models/post';

// Mock the models
jest.mock('../../models/user');
jest.mock('../../models/post');

describe('Profile Routes', () => {
  let currentUserId: string;
  let mockJwtVerify: jest.SpyInstance;
  let mockConfigGet: jest.SpyInstance;

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

    mockConfigGet = jest
      .spyOn(require('config'), 'get')
      .mockReturnValue('test-secret');
  });

  describe('GET /profile', () => {
    it('should get current user profile successfully', async () => {
      const mockUser = {
        _id: new Types.ObjectId(currentUserId),
        username: 'currentUser',
        email: 'current@example.com',
        avatar: 'avatar.jpg',
        bio: 'User bio',
        posts: [
          {
            _id: new Types.ObjectId(),
            title: 'Post 1',
            content: 'Content 1',
            author_id: {
              _id: new Types.ObjectId(currentUserId),
              email: 'current@example.com',
              username: 'currentUser',
              avatar: 'avatar.jpg',
            },
            createdAt: new Date(),
          },
        ],
        followers: [],
        following: [],
      };

      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      (User.findById as jest.Mock).mockReturnValue({ select: mockSelect });

      const res = await request(app)
        .get('/profile')
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('currentUser');
      expect(res.body.email).toBe('current@example.com');
      expect(mockSelect).toHaveBeenCalledWith('-password');
    });

    it('should return 401 if user is not authenticated', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await request(app).get('/profile');

      expect(res.status).toBe(401);
    });

    it('should return 404 if user not found', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      (User.findById as jest.Mock).mockReturnValue({ select: mockSelect });

      const res = await request(app)
        .get('/profile')
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 500 if database query fails', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Database error'));
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      (User.findById as jest.Mock).mockReturnValue({ select: mockSelect });

      const res = await request(app)
        .get('/profile')
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('GET /profile/:id', () => {
    it('should get user profile by id successfully', async () => {
      const targetUserId = new Types.ObjectId().toString();
      const mockUser = {
        _id: new Types.ObjectId(targetUserId),
        username: 'targetUser',
        email: 'target@example.com',
        avatar: 'avatar.jpg',
        bio: 'Target user bio',
        posts: [],
        followers: [],
        following: [],
      };

      const mockExec = jest.fn().mockResolvedValue(mockUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      (User.findById as jest.Mock).mockReturnValue({ select: mockSelect });

      const res = await request(app)
        .get(`/profile/${targetUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('targetUser');
      expect(res.body.email).toBe('target@example.com');
    });

    it('should return 401 if user is not authenticated', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const targetUserId = new Types.ObjectId().toString();
      const res = await request(app).get(`/profile/${targetUserId}`);

      expect(res.status).toBe(401);
    });

    it('should return 404 if target user not found', async () => {
      const targetUserId = new Types.ObjectId().toString();

      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      (User.findById as jest.Mock).mockReturnValue({ select: mockSelect });

      const res = await request(app)
        .get(`/profile/${targetUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 500 if database query fails', async () => {
      const targetUserId = new Types.ObjectId().toString();

      const mockExec = jest.fn().mockRejectedValue(new Error('Database error'));
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      (User.findById as jest.Mock).mockReturnValue({ select: mockSelect });

      const res = await request(app)
        .get(`/profile/${targetUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('POST /profile/follow/:id', () => {
    it('should follow user successfully', async () => {
      const targetUserId = new Types.ObjectId().toString();

      const mockTargetUser = {
        _id: new Types.ObjectId(targetUserId),
        username: 'targetUser',
        followers: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockCurrentUser = {
        _id: new Types.ObjectId(currentUserId),
        username: 'currentUser',
        following: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockExec = jest.fn().mockResolvedValue(mockTargetUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });

      (User.findById as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockResolvedValueOnce(mockCurrentUser);

      const res = await request(app)
        .post(`/profile/follow/${targetUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User followed successfully');
      expect(mockTargetUser.save).toHaveBeenCalled();
      expect(mockCurrentUser.save).toHaveBeenCalled();
    });

    it('should unfollow user if already following', async () => {
      const targetUserId = new Types.ObjectId().toString();

      const mockTargetUser = {
        _id: new Types.ObjectId(targetUserId),
        username: 'targetUser',
        followers: [new Types.ObjectId(currentUserId)],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockCurrentUser = {
        _id: new Types.ObjectId(currentUserId),
        username: 'currentUser',
        following: [new Types.ObjectId(targetUserId)],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockExec = jest.fn().mockResolvedValue(mockTargetUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });

      (User.findById as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockResolvedValueOnce(mockCurrentUser);

      const res = await request(app)
        .post(`/profile/follow/${targetUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User unfollowed successfully');
      expect(mockTargetUser.save).toHaveBeenCalled();
      expect(mockCurrentUser.save).toHaveBeenCalled();
    });

    it('should return 404 if target user not found', async () => {
      const targetUserId = new Types.ObjectId().toString();

      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      (User.findById as jest.Mock).mockReturnValue({ select: mockSelect });

      const res = await request(app)
        .post(`/profile/follow/${targetUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 404 if current user not found', async () => {
      const targetUserId = new Types.ObjectId().toString();

      const mockTargetUser = {
        _id: new Types.ObjectId(targetUserId),
        username: 'targetUser',
        followers: [],
      };

      const mockExec = jest.fn().mockResolvedValue(mockTargetUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });

      (User.findById as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockResolvedValueOnce(null);

      const res = await request(app)
        .post(`/profile/follow/${targetUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Authenticated user not found');
    });

    it('should return 401 if user is not authenticated', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const targetUserId = new Types.ObjectId().toString();
      const res = await request(app).post(`/profile/follow/${targetUserId}`);

      expect(res.status).toBe(401);
    });

    it('should return 500 if save operation fails', async () => {
      const targetUserId = new Types.ObjectId().toString();

      const mockTargetUser = {
        _id: new Types.ObjectId(targetUserId),
        username: 'targetUser',
        followers: [],
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
      };

      const mockCurrentUser = {
        _id: new Types.ObjectId(currentUserId),
        username: 'currentUser',
        following: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockExec = jest.fn().mockResolvedValue(mockTargetUser);
      const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });

      (User.findById as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockResolvedValueOnce(mockCurrentUser);

      const res = await request(app)
        .post(`/profile/follow/${targetUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Save failed');
    });
  });

  describe('PATCH /profile/update/:id', () => {
    it('should update profile successfully', async () => {
      const updateBody = {
        bio: 'Updated bio',
        avatar: 'new-avatar.jpg',
        username: 'newUsername',
      };

      const mockUpdatedUser = {
        _id: new Types.ObjectId(currentUserId),
        username: updateBody.username,
        email: 'current@example.com',
        bio: updateBody.bio,
        avatar: updateBody.avatar,
        posts: [],
        populate: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(currentUserId),
          username: updateBody.username,
          email: 'current@example.com',
          bio: updateBody.bio,
          avatar: updateBody.avatar,
          posts: [],
        }),
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const res = await request(app)
        .patch(`/profile/update/${currentUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully');
      expect(res.body.user.bio).toBe(updateBody.bio);
      expect(res.body.user.avatar).toBe(updateBody.avatar);
    });

    it('should update profile with partial data', async () => {
      const updateBody = {
        bio: 'Updated bio only',
      };

      const mockUpdatedUser = {
        _id: new Types.ObjectId(currentUserId),
        username: 'currentUser',
        email: 'current@example.com',
        bio: updateBody.bio,
        avatar: 'old-avatar.jpg',
        posts: [],
        populate: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(currentUserId),
          username: 'currentUser',
          email: 'current@example.com',
          bio: updateBody.bio,
          avatar: 'old-avatar.jpg',
          posts: [],
        }),
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const res = await request(app)
        .patch(`/profile/update/${currentUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully');
      expect(res.body.user.bio).toBe(updateBody.bio);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const updateBody = {
        bio: 'Updated bio',
      };

      const res = await request(app)
        .patch(`/profile/update/${currentUserId}`)
        .send(updateBody);

      expect(res.status).toBe(401);
    });

    it("should return 403 if trying to update another user's profile", async () => {
      const otherUserId = new Types.ObjectId().toString();
      const updateBody = {
        bio: "Trying to update someone else's bio",
      };

      const res = await request(app)
        .patch(`/profile/update/${otherUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "Forbidden: You cannot edit another user's profile",
      );
    });

    it('should return 400 if validation fails - bio too long', async () => {
      const updateBody = {
        bio: 'a'.repeat(501), // Exceeds 500 character limit
      };

      const res = await request(app)
        .patch(`/profile/update/${currentUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid input');
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 if validation fails - username too short', async () => {
      const updateBody = {
        username: 'ab', // Less than 3 characters
      };

      const res = await request(app)
        .patch(`/profile/update/${currentUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid input');
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 if validation fails - username too long', async () => {
      const updateBody = {
        username: 'a'.repeat(31), // Exceeds 30 character limit
      };

      const res = await request(app)
        .patch(`/profile/update/${currentUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid input');
      expect(res.body.errors).toBeDefined();
    });

    it('should return 404 if user not found', async () => {
      const updateBody = {
        bio: 'Updated bio',
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch(`/profile/update/${currentUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 500 if database update fails', async () => {
      const updateBody = {
        bio: 'Updated bio',
      };

      (User.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      const res = await request(app)
        .patch(`/profile/update/${currentUserId}`)
        .set('Cookie', 'auth-token=mock-jwt-token')
        .send(updateBody);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Database error');
    });
  });
});
