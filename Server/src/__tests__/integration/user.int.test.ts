// __tests__/app.int.test.ts
import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";

describe("App Integration Tests", () => {
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("GET /ping should return pong", async () => {
        const res = await request(app).get("/ping");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: "pong" });
    });
});
