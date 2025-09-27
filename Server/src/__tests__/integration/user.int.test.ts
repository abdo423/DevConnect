import request from "supertest";
import app from "../../app";
import User from "../../models/user";
import bcrypt from "bcryptjs";

describe("User route", () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /login", () => {
        it("should login successfully with valid credentials", async () => {
            jest.spyOn(User, "findOne").mockResolvedValue({
                _id: "mockId",
                username: "testUsername",
                email: "test@example.com",
                password: "hashedPassword", // doesn't matter, we mock compare
                avatar: "",
                bio: "",
            } as any);

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
            jest.spyOn(User, "findOne").mockResolvedValue(null);

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
            jest.spyOn(User, "findOne").mockResolvedValue({
                _id: "mockId",
                username: "testUsername",
                email: "test@example.com",
                password: "hashedPassword",
            } as any);

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
            jest.spyOn(User, "findOne").mockResolvedValue(null); // no duplicates
            jest.spyOn(User.prototype, "save").mockResolvedValue({} as any);

            const res = await request(app)
                .post("/Auth/register")
                .send({email: "test1@example.com", password: "password123", username: "newUser"});

            expect(res.status).toBe(201);
            expect(res.body.message).toBe("User created successfully");
        });

        it("should fail if email already exists", async () => {
            jest.spyOn(User, "findOne")
                .mockResolvedValueOnce({email: "test@example.com", username: "abc"} as any)
                .mockResolvedValueOnce(null); // next call returns null

            const res = await request(app)
                .post("/Auth/register")
                .send({email: "test@example.com", password: "password123", username: "newUser"});

            expect(res.status).toBe(409);
            expect(res.body.message).toBe("Email already in use");
        });

        it("should fail if username already taken", async () => {
            jest.spyOn(User, "findOne")
                .mockResolvedValueOnce({email: "test@example.com", username: "takenUsername"} as any)
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
            // Mock JWT verification - this will be called by the controller
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

            // Mock the User model for the service call
            const mockUser = {
                _id: "mockId",
                username: "testUsername",
                email: "test@example.com",
                avatar: "",
                bio: "",
            };

            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            jest.spyOn(User, "findById").mockReturnValue({
                select: mockSelect,
            } as any);

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
                    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
                });

            // Mock config.get for JWT secret
            const configMock = jest.spyOn(require('config'), 'get')
                .mockReturnValue('test-secret');

            // Mock User.findById to return null (user not found)
            const mockSelect = jest.fn().mockResolvedValue(null);
            jest.spyOn(User, "findById").mockReturnValue({
                select: mockSelect,
            } as any);

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