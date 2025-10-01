import { Request, Response } from 'express';
import * as profileController from '../../controllers/profile';
import * as profileService from '../../services/profileService';
import { Types } from 'mongoose';

jest.mock('../../services/profileService');
const userId = new Types.ObjectId().toString();
const targetUserId = new Types.ObjectId().toString();

describe('Profile Controller', () => {
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

  describe('getProfile', () => {
    it('should return 200 and user data when successful', async () => {
      const mockUser = { id: userId, username: 'testuser' };
      (profileService.getProfile as jest.Mock).mockResolvedValue(mockUser);

      req = { user: { id: userId } } as Partial<Request>;

      await profileController.getProfile(req as Request, res as Response);

      expect(profileService.getProfile).toHaveBeenCalledWith(userId);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockUser);
    });

    it('should return 401 if no userId is provided', async () => {
      (profileService.getProfile as jest.Mock).mockRejectedValue({
        status: 401,
        message: 'Unauthorized',
      });

      req = { user: { id: '' } } as Partial<Request>;

      await profileController.getProfile(req as Request, res as Response);

      expect(profileService.getProfile).toHaveBeenCalledWith('');
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('should return 404 if user not found', async () => {
      (profileService.getProfile as jest.Mock).mockRejectedValue({
        status: 404,
        message: 'User not found',
      });

      req = { user: { id: 'does-not-exist' } } as Partial<Request>;

      await profileController.getProfile(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      (profileService.getProfile as jest.Mock).mockRejectedValue(
        new Error('DB crashed'),
      );

      req = { user: { id: userId } } as Partial<Request>;

      await profileController.getProfile(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'DB crashed',
      });
    });
  });

  describe('getProfileById', () => {
    it('should return 200 and user data when successful', async () => {
      const mockUser = { id: targetUserId, username: 'targetuser' };
      (profileService.getProfileById as jest.Mock).mockResolvedValue(mockUser);

      req = {
        params: { id: targetUserId },
        user: { id: userId },
      } as Partial<Request>;

      await profileController.getProfileById(req as Request, res as Response);

      expect(profileService.getProfileById).toHaveBeenCalledWith(
        targetUserId,
        userId,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockUser);
    });

    it('should return 401 if requester is not authenticated', async () => {
      (profileService.getProfileById as jest.Mock).mockRejectedValue({
        status: 401,
        message: 'Unauthorized: User not authenticated',
      });

      req = {
        params: { id: targetUserId },
        user: { id: '' },
      } as Partial<Request>;

      await profileController.getProfileById(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Unauthorized: User not authenticated',
      });
    });

    it('should return 404 if target user not found', async () => {
      (profileService.getProfileById as jest.Mock).mockRejectedValue({
        status: 404,
        message: 'User not found',
      });

      req = {
        params: { id: 'non-existent' },
        user: { id: userId },
      } as Partial<Request>;

      await profileController.getProfileById(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });
  });

  describe('followUser', () => {
    it('should follow user successfully', async () => {
      const mockUser = { id: targetUserId, username: 'targetuser' };
      (profileService.followUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        alreadyFollowing: false,
      });

      req = {
        params: { id: targetUserId },
        user: { id: userId },
      } as Partial<Request>;

      await profileController.followUser(req as Request, res as Response);

      expect(profileService.followUser).toHaveBeenCalledWith(
        targetUserId,
        userId,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        user: mockUser,
        message: 'User followed successfully',
      });
    });

    it('should unfollow user successfully', async () => {
      const mockUser = { id: targetUserId, username: 'targetuser' };
      (profileService.followUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        alreadyFollowing: true,
      });

      req = {
        params: { id: targetUserId },
        user: { id: userId },
      } as Partial<Request>;

      await profileController.followUser(req as Request, res as Response);

      expect(profileService.followUser).toHaveBeenCalledWith(
        targetUserId,
        userId,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        user: mockUser,
        message: 'User unfollowed successfully',
      });
    });

    it('should return 404 if target user not found', async () => {
      (profileService.followUser as jest.Mock).mockRejectedValue({
        status: 404,
        message: 'User not found',
      });

      req = {
        params: { id: 'non-existent' },
        user: { id: userId },
      } as Partial<Request>;

      await profileController.followUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 404 if authenticated user not found', async () => {
      (profileService.followUser as jest.Mock).mockRejectedValue({
        status: 404,
        message: 'Authenticated user not found',
      });

      req = {
        params: { id: targetUserId },
        user: { id: 'invalid-user' },
      } as Partial<Request>;

      await profileController.followUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Authenticated user not found',
      });
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      bio: 'Updated bio',
      username: 'newusername',
    };

    it('should update profile successfully', async () => {
      const mockUpdatedUser = {
        id: userId,
        username: 'newusername',
        bio: 'Updated bio',
      };
      (profileService.updateProfile as jest.Mock).mockResolvedValue(
        mockUpdatedUser,
      );

      req = {
        params: { id: userId },
        user: { id: userId },
        body: updateData,
      } as Partial<Request>;

      await profileController.updateProfile(req as Request, res as Response);

      expect(profileService.updateProfile).toHaveBeenCalledWith(
        userId,
        userId,
        updateData,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        user: mockUpdatedUser,
      });
    });

    it('should return 401 if requester is not authenticated', async () => {
      (profileService.updateProfile as jest.Mock).mockRejectedValue({
        status: 401,
        message: 'Unauthorized: User not authenticated',
      });

      req = {
        params: { id: userId },
        user: { id: '' },
        body: updateData,
      } as Partial<Request>;

      await profileController.updateProfile(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Unauthorized: User not authenticated',
      });
    });

    it("should return 403 if trying to update another user's profile", async () => {
      (profileService.updateProfile as jest.Mock).mockRejectedValue({
        status: 403,
        message: "Forbidden: You cannot edit another user's profile",
      });

      req = {
        params: { id: targetUserId },
        user: { id: userId },
        body: updateData,
      } as Partial<Request>;

      await profileController.updateProfile(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Forbidden: You cannot edit another user's profile",
      });
    });

    it('should return 404 if user not found', async () => {
      (profileService.updateProfile as jest.Mock).mockRejectedValue({
        status: 404,
        message: 'User not found',
      });

      req = {
        params: { id: 'non-existent' },
        user: { id: 'non-existent' },
        body: updateData,
      } as Partial<Request>;

      await profileController.updateProfile(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 400 for invalid input data', async () => {
      const errors = [
        {
          code: 'too_long',
          maximum: 500,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'String must contain at most 500 character(s)',
          path: ['bio'],
        },
      ];

      (profileService.updateProfile as jest.Mock).mockRejectedValue({
        status: 400,
        message: 'Invalid input',
        errors: errors,
      });

      const invalidData = {
        bio: 'a'.repeat(501), // Too long bio
      };

      req = {
        params: { id: userId },
        user: { id: userId },
        body: invalidData,
      } as Partial<Request>;

      await profileController.updateProfile(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid input',
        errors: errors,
      });
    });

    it('should return 500 for unexpected errors', async () => {
      (profileService.updateProfile as jest.Mock).mockRejectedValue(
        new Error('Database connection failed'),
      );

      req = {
        params: { id: userId },
        user: { id: userId },
        body: updateData,
      } as Partial<Request>;

      await profileController.updateProfile(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Database connection failed',
      });
    });
  });
});
