import { Request, Response } from 'express';
import * as userController from '../../controllers/user';
import * as userService from '../../services/userService';
import { Types } from 'mongoose';

const userId = new Types.ObjectId().toString();

// Create proper mock types that match your actual interfaces
interface MockUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
}

// Mock for Request.user (JWT payload) - needs index signature for JWTPayload compatibility
interface MockJWTUser {
  id: string;
  username: string;
  email: string;
  [key: string]: any; // Index signature for JWTPayload compatibility
}

// Mock for service response
interface MockUserDocument extends MockUser {
  __v?: number;
  save?: jest.Mock;
  toObject?: jest.Mock;
}

describe('User Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockCookie: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockCookie = jest.fn().mockReturnThis();

    req = {
      body: { email: 'test@example.com', password: 'password123' },
    };
    res = {
      status: mockStatus,
      json: mockJson,
      cookie: mockCookie,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should return 200 and user data if login successful', async () => {
      const mockUser: MockUser = {
        _id: new Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        avatar: 'test.png',
        bio: 'test bio',
      };

      jest.spyOn(userService, 'loginUser').mockResolvedValue({
        user: mockUser,
        token: 'mocked-jwt',
      } as Awaited<ReturnType<typeof userService.loginUser>>);

      await userController.loginUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockCookie).toHaveBeenCalledWith(
        'auth-token',
        'mocked-jwt',
        expect.any(Object),
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Successfully logged in',
          user: expect.objectContaining({
            username: 'testuser',
            email: 'test@example.com',
          }),
        }),
      );
    });

    it('should return 400 if validation fails', async () => {
      (userService.loginUser as jest.Mock).mockRejectedValue({
        status: 400,
        message: 'Validation failed',
        errors: [{ message: 'Email is required' }],
      });

      await userController.loginUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: [{ message: 'Email is required' }],
      });
    });

    it('should return 401 if invalid credentials', async () => {
      (userService.loginUser as jest.Mock).mockRejectedValue({
        status: 401,
        message: 'Invalid credentials',
      });

      await userController.loginUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials',
        errors: undefined,
      });
    });

    it("should return 404 if account doesn't exist", async () => {
      (userService.loginUser as jest.Mock).mockRejectedValue({
        status: 404,
        message: "Account doesn't exist",
      });

      await userController.loginUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Account doesn't exist",
        errors: undefined,
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      (userService.loginUser as jest.Mock).mockRejectedValue(
        new Error('DB crashed'),
      );

      await userController.loginUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'DB crashed',
        errors: undefined,
      });
    });
  });

  describe('registerUser', () => {
    beforeEach(() => {
      req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          bio: 'test bio',
          avatar: 'test.png',
        },
      };
    });

    it('should return 201 and user data if registration successful', async () => {
      jest.spyOn(userService, 'registerUser').mockResolvedValue({
        username: 'testuser',
        email: 'test@example.com',
      });

      await userController.registerUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'User created successfully',
        user: { username: 'testuser', email: 'test@example.com' },
      });
    });

    it('should return 409 if email already exists', async () => {
      jest.spyOn(userService, 'registerUser').mockRejectedValue({
        status: 409,
        message: 'Email already in use',
      });

      await userController.registerUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Email already in use',
        errors: undefined,
      });
    });
    it('should return 409 if username already exists', async () => {
      jest.spyOn(userService, 'registerUser').mockRejectedValue({
        status: 409,
        message: 'Username already taken',
      });

      await userController.registerUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Username already taken',
        errors: undefined,
      });
    });

    it('should return 400 if validation fails', async () => {
      jest.spyOn(userService, 'registerUser').mockRejectedValue({
        status: 400,
        message: 'Validation failed',
        errors: [{ field: 'email', message: 'Invalid email' }],
      });

      await userController.registerUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'email', message: 'Invalid email' }],
      });
    });

    it('should return 500 if server error', async () => {
      jest
        .spyOn(userService, 'registerUser')
        .mockRejectedValue(new Error('DB error'));

      await userController.registerUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'DB error',
        errors: undefined,
      });
    });
  });

  describe('logoutUser', () => {
    beforeEach(() => {
      req = {
        cookies: { 'auth-token': 'mocked-jwt' },
      };
      res = {
        status: mockStatus,
        json: mockJson,
        clearCookie: jest.fn().mockReturnThis(),
      };
    });

    it('should clear cookie and return success if user was logged in', async () => {
      jest.spyOn(userService, 'logoutUser').mockResolvedValue({
        alreadyLoggedOut: false,
      });

      await userController.logoutUser(req as Request, res as Response);

      expect(userService.logoutUser).toHaveBeenCalledWith(true);
      expect(res.clearCookie).toHaveBeenCalledWith(
        'auth-token',
        expect.any(Object),
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
        clientSideCleanup: true,
      });
    });

    it("should return success with 'No active session' if already logged out", async () => {
      req = { cookies: {} }; // no auth-token cookie
      res = {
        status: mockStatus,
        json: mockJson,
        clearCookie: mockCookie,
      };

      jest.spyOn(userService, 'logoutUser').mockResolvedValue({
        alreadyLoggedOut: true,
      });

      await userController.logoutUser(req as Request, res as Response);

      expect(userService.logoutUser).toHaveBeenCalledWith(false);
      expect(res.clearCookie).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'No active session found',
        clientSideCleanup: true,
      });
    });

    it('should return 500 if service throws error', async () => {
      jest
        .spyOn(userService, 'logoutUser')
        .mockRejectedValue(new Error('DB error'));

      await userController.logoutUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to logout',
        error: process.env.NODE_ENV === 'development' ? 'DB error' : undefined,
      });
    });
  });

  describe('checkLoginUser', () => {
    it('should return 401 if no token is provided', async () => {
      const req = {
        cookies: { 'auth-token': '' },
      } as Partial<Request>;

      const res = {
        status: mockStatus,
        json: mockJson,
      } as unknown as Response;

      await userController.loginUserCheck(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ loggedIn: false });
    });

    it('should return 200 user is logged in', async () => {
      const mockUserDocument: MockUserDocument = {
        _id: new Types.ObjectId(userId),
        username: 'testuser',
        email: 'test@example.com',
        __v: 0,
      };

      const mockJWTUser: MockJWTUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
      };

      const req = {
        cookies: { 'auth-token': 'mocked-jwt' },
        user: mockJWTUser,
      } as unknown as Partial<Request>;

      const res = {
        status: mockStatus,
        json: mockJson,
      } as unknown as Response;

      jest.spyOn(userService, 'loginUserCheck').mockResolvedValue({
        loggedIn: true,
        user: mockUserDocument as any, // Service returns Mongoose document
      });

      await userController.loginUserCheck(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          loggedIn: true,
          user: expect.objectContaining({
            _id: expect.any(Types.ObjectId),
            username: 'testuser',
          }),
        }),
      );
    });

    it('should return 401 if loginUserCheck rejects', async () => {
      const req = {
        cookies: { 'auth-token': 'mocked-jwt' },
      } as Partial<Request>;

      const res = {
        status: mockStatus,
        json: mockJson,
      } as unknown as Response;

      jest.spyOn(userService, 'loginUserCheck').mockRejectedValue({
        status: 401,
        loggedIn: false,
      });

      await userController.loginUserCheck(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ loggedIn: false });
    });
  });

  describe('getUser', () => {
    beforeEach(() => {
      req = {
        params: { id: userId },
      };
    });

    it('should return 200 and user data if user exists', async () => {
      const mockUser: MockUserDocument = {
        _id: new Types.ObjectId(userId),
        username: 'testuser',
        email: 'test@example.com',
        bio: 'test bio',
        avatar: 'test.png',
      };

      jest.spyOn(userService, 'getUser').mockResolvedValue(mockUser as any);

      await userController.getUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        user: expect.objectContaining({
          _id: expect.any(Types.ObjectId),
          username: 'testuser',
          email: 'test@example.com',
        }),
      });
    });

    it('should return 404 if user not found', async () => {
      jest.spyOn(userService, 'getUser').mockRejectedValue({
        status: 404,
        message: 'User not found',
      });

      await userController.getUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should return 500 if server error', async () => {
      jest
        .spyOn(userService, 'getUser')
        .mockRejectedValue(new Error('DB error'));

      await userController.getUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'DB error',
      });
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      req = {
        params: { id: userId },
      };
    });

    it('should return 200 and success message if user deleted', async () => {
      jest.spyOn(userService, 'deleteUser').mockResolvedValue({
        message: 'User deleted successfully',
      });

      await userController.deleteUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      });
    });

    it('should return 404 if user not found', async () => {
      jest.spyOn(userService, 'deleteUser').mockRejectedValue({
        status: 404,
        message: 'User not found',
      });

      await userController.deleteUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should return 500 if server error', async () => {
      jest
        .spyOn(userService, 'deleteUser')
        .mockRejectedValue(new Error('DB error'));

      await userController.deleteUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'DB error',
      });
    });
  });

  describe('getAllFollowings', () => {
    beforeEach(() => {
      req = {
        params: { id: userId },
      };
    });

    it('should return 200 and following users', async () => {
      const mockFollowingUsers = [
        {
          _id: new Types.ObjectId(),
          username: 'follower1',
          email: 'follower1@example.com',
        },
        {
          _id: new Types.ObjectId(),
          username: 'follower2',
          email: 'follower2@example.com',
        },
      ];

      jest.spyOn(userService, 'getAllFollowings').mockResolvedValue({
        message: 'Following users fetched successfully',
        following: mockFollowingUsers as any, // Cast to handle Mongoose Document type
      });

      await userController.getAllFollowings(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Following users fetched successfully',
        following: expect.arrayContaining([
          expect.objectContaining({
            username: 'follower1',
          }),
          expect.objectContaining({
            username: 'follower2',
          }),
        ]),
      });
    });

    it('should return 404 if user not found', async () => {
      jest.spyOn(userService, 'getAllFollowings').mockRejectedValue({
        status: 404,
        message: 'User not found',
      });

      await userController.getAllFollowings(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should return 500 if server error', async () => {
      jest
        .spyOn(userService, 'getAllFollowings')
        .mockRejectedValue(new Error('DB error'));

      await userController.getAllFollowings(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'DB error',
      });
    });
  });

  describe('getSendersForCurrentUser', () => {
    beforeEach(() => {
      const mockJWTUser: MockJWTUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
      };

      req = {
        user: mockJWTUser as any, // Cast to handle JWTPayload type
      };
    });

    it('should return 401 if user not authenticated', async () => {
      req = { user: undefined };

      await userController.getSendersForCurrentUser(
        req as Request,
        res as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User not authenticated',
      });
    });

    it('should return 200 and senders list', async () => {
      const mockSenders = [
        {
          _id: new Types.ObjectId(),
          username: 'sender1',
          avatar: 'avatar1.png',
        },
        {
          _id: new Types.ObjectId(),
          username: 'sender2',
          avatar: 'avatar2.png',
        },
      ];

      jest.spyOn(userService, 'getSendersForCurrentUser').mockResolvedValue({
        senders: mockSenders,
        count: 2,
      });

      await userController.getSendersForCurrentUser(
        req as Request,
        res as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        senders: expect.arrayContaining([
          expect.objectContaining({
            username: 'sender1',
          }),
          expect.objectContaining({
            username: 'sender2',
          }),
        ]),
        count: 2,
      });
    });

    it('should return 404 if user not found', async () => {
      jest.spyOn(userService, 'getSendersForCurrentUser').mockRejectedValue({
        status: 404,
        message: 'User not found',
      });

      await userController.getSendersForCurrentUser(
        req as Request,
        res as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should return 500 if server error', async () => {
      jest
        .spyOn(userService, 'getSendersForCurrentUser')
        .mockRejectedValue(new Error('DB error'));

      await userController.getSendersForCurrentUser(
        req as Request,
        res as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'DB error',
      });
    });
  });
});
