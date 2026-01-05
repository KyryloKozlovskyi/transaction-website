const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("./testApp");
const User = require("../models/User");

describe("Authentication Integration Tests", () => {
  describe("User Registration/Creation", () => {
    it("should hash password on user creation", async () => {
      const user = await User.create({
        username: "newuser@example.com",
        password: "plaintextpassword",
        isAdmin: false,
      });

      expect(user.password).not.toBe("plaintextpassword");
      const isValid = await bcrypt.compare("plaintextpassword", user.password);
      expect(isValid).toBe(true);
    });

    it("should prevent duplicate usernames", async () => {
      await User.create({
        username: "duplicate@example.com",
        password: "password123",
        isAdmin: false,
      });

      try {
        await User.create({
          username: "duplicate@example.com",
          password: "password456",
          isAdmin: false,
        });
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe("Login Flow", () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash("testpass123", 10);
      await User.collection.insertOne({
        username: "testuser@example.com",
        password: hashedPassword,
        isAdmin: true,
      });
    });

    it("should login with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "testuser@example.com",
        password: "testpass123",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
    });

    it("should reject incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "testuser@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should reject non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.status).toBe(401);
    });

    it("should return user data with token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "testuser@example.com",
        password: "testpass123",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("username");
      expect(res.body.user).toHaveProperty("isAdmin");
      expect(res.body.user).not.toHaveProperty("password");
    });
  });

  describe("Token Validation", () => {
    it("should verify valid token", async () => {
      const token = jwt.sign(
        { userId: "testUserId", isAdmin: true },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "24h" }
      );

      const res = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Token is valid");
    });

    it("should reject expired token", async () => {
      const token = jwt.sign(
        { userId: "testUserId", isAdmin: true },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "-1h" } // Expired 1 hour ago
      );

      const res = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(401);
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", "Bearer invalid-token-string");

      expect(res.status).toBe(401);
    });

    it("should reject missing token", async () => {
      const res = await request(app).get("/api/auth/verify");

      expect(res.status).toBe(401);
    });
  });

  describe("Authorization Checks", () => {
    let adminToken, regularUserToken;

    beforeEach(async () => {
      // Create admin user
      const adminHashedPassword = await bcrypt.hash("adminpass", 10);
      const admin = await User.collection.insertOne({
        username: "admin@example.com",
        password: adminHashedPassword,
        isAdmin: true,
      });

      // Create regular user
      const userHashedPassword = await bcrypt.hash("userpass", 10);
      const user = await User.collection.insertOne({
        username: "user@example.com",
        password: userHashedPassword,
        isAdmin: false,
      });

      adminToken = jwt.sign(
        { userId: admin.insertedId.toString(), isAdmin: true },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "24h" }
      );

      regularUserToken = jwt.sign(
        { userId: user.insertedId.toString(), isAdmin: false },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "24h" }
      );
    });

    it("should allow admin to create events", async () => {
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          courseName: "Admin Event",
          venue: "Admin Venue",
          date: new Date(),
          price: 100,
          emailText: "Admin email",
        });

      expect([201, 200]).toContain(res.status);
    });

    it("should prevent non-admin from creating events", async () => {
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send({
          courseName: "User Event",
          venue: "User Venue",
          date: new Date(),
          price: 100,
          emailText: "User email",
        });

      expect([401, 403]).toContain(res.status);
    });
  });

  describe("Session Management", () => {
    it("should handle multiple concurrent sessions", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.collection.insertOne({
        username: "multiuser@example.com",
        password: hashedPassword,
        isAdmin: true,
      });

      // Login multiple times
      const login1 = await request(app).post("/api/auth/login").send({
        username: "multiuser@example.com",
        password: "password123",
      });

      const login2 = await request(app).post("/api/auth/login").send({
        username: "multiuser@example.com",
        password: "password123",
      });

      expect(login1.status).toBe(200);
      expect(login2.status).toBe(200);
      expect(login1.body.token).not.toBe(login2.body.token);

      // Both tokens should be valid
      const verify1 = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${login1.body.token}`);

      const verify2 = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${login2.body.token}`);

      expect(verify1.status).toBe(200);
      expect(verify2.status).toBe(200);
    });
  });

  describe("Security Headers", () => {
    it("should not expose sensitive information in errors", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).not.toContain("password");
      expect(res.body.message).not.toContain("hash");
    });

    it("should include security headers in responses", async () => {
      const res = await request(app).get("/api/events");

      expect(res.headers).toHaveProperty("access-control-allow-origin");
    });
  });
});
