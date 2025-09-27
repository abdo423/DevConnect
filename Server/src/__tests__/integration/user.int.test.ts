import request from "supertest";
import app from "../../app";
import User from "../../models/user";
import bcrypt from "bcryptjs";

// Mock the entire User model to avoid database connections
jest.mock("../../models/user");
const MockedUser = User as jest.Mocked<typeof User>;

describe("User route", () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /login", () => {
        it("should login successfully with valid credentials", async () => {
            (MockedUser.findOne as jest.Mock).mockResolvedValue({
                _id: "mockId",
                username: "testUsername",
                email: "test@example.com",
                password: "hashedPassword", // doesn't matter, we mock compare
                avatar: "",
                bio: "",
            });

            const bcryptMock = jest
                .spyOn(bcrypt, "compare")
                .mockImplementationOnce(async () => true); // mock password match

            const res = await request(app)
                .post("/Auth/login")
                .send({email: "test@example.com", password: "password123"});

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Successfully logged in");

            bcryptMock.mockRestore();
        });

        it("should fail if user does not exist", async () => {
            (MockedUser.findOne as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .post("/Auth/login")
                .send({email: "notfound@example.com", password: "password123"});

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Account doesn't exist");
        });

        it("should fail validation for invalid payload", async () => {
            const res = await request(app)
                .post("/Auth/login")
                .send({email: "x", password: "123"});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Validation failed");
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it("should fail with wrong password", async () => {
            (MockedUser.findOne as jest.Mock).mockResolvedValue({
                _id: "mockId",
                username: "testUsername",
                email: "test@example.com",
                password: "hashedPassword",
            });

            const bcryptMock = jest
                .spyOn(bcrypt, "compare")
                .mockImplementationOnce(async () => false);

            const res = await request(app)
                .post("/Auth/login")
                .send({email: "test@example.com", password: "wrongpassword"});

            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Invalid credentials");

            bcryptMock.mockRestore();
        });
    });

    describe("POST /register", () => {
        it("should register user successfully with valid credentials", async () => {
            (MockedUser.findOne as jest.Mock).mockResolvedValue(null); // no duplicates
            (MockedUser.prototype.save as jest.Mock).mockResolvedValue({});

            const res = await request(app)
                .post("/Auth/register")
                .send({email: "test1@example.com", password: "password123", username: "newUser"});

            expect(res.status).toBe(201);
            expect(res.body.message).toBe("User created successfully");
        });

        it("should fail if email already exists", async () => {
            (MockedUser.findOne as jest.Mock)
                .mockResolvedValueOnce({email: "test@example.com", username: "abc"})
                .mockResolvedValueOnce(null); // next call returns null

            const res = await request(app)
                .post("/Auth/register")
                .send({email: "test@example.com", password: "password123", username: "newUser"});

            expect(res.status).toBe(409);
            expect(res.body.message).toBe("Email already in use");
        });

        it("should fail if username already taken", async () => {
            (MockedUser.findOne as jest.Mock)
                .mockResolvedValueOnce({email: "test@example.com", username: "takenUsername"})
                .mockResolvedValueOnce(null); // next call returns null

            const res = await request(app)
                .post("/Auth/register")
                .send({email: "unique@example.com", password: "password123", username: "takenUsername"});

            expect(res.status).toBe(409);
            expect(res.body.message).toBe("Username already taken");
        });

        it("should fail validation for invalid payload", async () => {
            const res = await request(app)
                .post("/Auth/register")
                .send({email: "x", password: "123", username: "ab"});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Validation failed");
            expect(res.body.errors.length).toBeGreaterThan(0);
        });
    });

    describe("GET /check", () => {
        it("should return loggedIn true for valid user", async () => {
            // Mock the User model for the service call
            const mockUser = {
                _id: "mockId",
                username: "testUsername",
                email: "test@example.com",
                avatar: "",
                bio: "",
            };

            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            (MockedUser.findById as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            // Mock JWT verification - this is called by checkTokenExpiration middleware
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockImplementation((token, secret) => {
                    console.log('JWT verify called with:', token, secret);
                    return {
                        id: "mockId",
                        email: "test@example.com",
                        username: "testUsername",
                        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
                    };
                });

            // Mock config.get for JWT secret
            const configMock = jest.spyOn(require('config'), 'get')
                .mockImplementation((key) => {
                    console.log('Config get called with:', key);
                    return 'test-secret';
                });

            // Make the request with a mock token cookie
            const res = await request(app)
                .get("/Auth/check")
                .set('Cookie', 'auth-token=mock-jwt-token');

            console.log('Response status:', res.status);
            console.log('Response body:', res.body);
            console.log('JWT mock called times:', jwtMock.mock.calls.length);
            console.log('Config mock called times:', configMock.mock.calls.length);

            expect(res.status).toBe(200);
            expect(res.body.loggedIn).toBe(true);
            expect(res.body.user.username).toBe("testUsername");

            // Verify the mocks were called correctly
            expect(jwtMock).toHaveBeenCalledWith('mock-jwt-token', 'test-secret');
            expect(mockSelect).toHaveBeenCalledWith("-password");

            jwtMock.mockRestore();
            configMock.mockRestore();
        });

        it("should return 401 if token is missing", async () => {
            const res = await request(app)
                .get("/Auth/check"); // No cookie/session

            expect(res.status).toBe(401);
            expect(res.body.loggedIn).toBe(false);
        });

        it("should return 401 if JWT verification fails", async () => {
            // Mock config.get for JWT secret
            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock JWT verification to throw an error (invalid token)
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockImplementation(() => {
                    throw new Error('Invalid token');
                });

            const res = await request(app)
                .get("/Auth/check")
                .set('Cookie', 'auth-token=invalid-token');

            expect(res.status).toBe(401);
            expect(res.body.loggedIn).toBe(false);

            jwtMock.mockRestore();
            configMock.mockRestore();
        });

        it("should return 401 if user not found in database", async () => {
            // Mock JWT verification to return a valid payload
            const jwtMock = jest.spyOn(require('jsonwebtoken'), 'verify')
                .mockReturnValue({
                    id: "mockId",
                    email: "test@example.com",
                    username: "testUsername",
                    exp: Math.floor(Date.now() / 1000) + 3600
                });

            // Mock config.get for JWT secret
            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock User.findById to return null (user not found)
            const mockSelect = jest.fn().mockResolvedValue(null);
            (MockedUser.findById as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            const res = await request(app)
                .get("/Auth/check")
                .set('Cookie', 'auth-token=mock-jwt-token');

            expect(res.status).toBe(401);
            expect(res.body.loggedIn).toBe(false);

            jwtMock.mockRestore();
            configMock.mockRestore();
        });
    });
});