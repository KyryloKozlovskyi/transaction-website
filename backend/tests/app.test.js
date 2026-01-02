const request = require("supertest");
const app = require("./testApp");
const User = require("../models/User");
const Event = require("../models/Event");
const Submission = require("../models/Submission");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper to create auth token
const createAuthToken = (userId, isAdmin = true) => {
  return jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

describe("API Endpoints", () => {
  describe("GET /api/events", () => {
    it("should return empty array when no events exist", async () => {
      const res = await request(app).get("/api/events");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return events when they exist", async () => {
      await Event.create({
        courseName: "Test Course",
        venue: "Test Venue",
        date: new Date(),
        price: 100,
        emailText: "Test email text",
      });
      const res = await request(app).get("/api/events");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].courseName).toBe("Test Course");
    });
  });

  describe("GET /api/events/:id", () => {
    it("should return 404 for non-existent event", async () => {
      const res = await request(app).get("/api/events/507f1f77bcf86cd799439011");
      expect(res.status).toBe(404);
    });

    it("should return event by id", async () => {
      const event = await Event.create({
        courseName: "Test Course",
        venue: "Test Venue",
        date: new Date(),
        price: 100,
        emailText: "Test email text",
      });
      const res = await request(app).get(`/api/events/${event._id}`);
      expect(res.status).toBe(200);
      expect(res.body.courseName).toBe("Test Course");
    });
  });

  describe("POST /api/events", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app).post("/api/events").send({
        courseName: "Test Course",
        venue: "Test Venue",
        date: new Date(),
        price: 100,
        emailText: "Test email text",
      });
      expect(res.status).toBe(401);
    });

    it("should create event with valid auth token", async () => {
      const token = createAuthToken("testUserId");
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${token}`)
        .send({
          courseName: "New Course",
          venue: "New Venue",
          date: new Date(),
          price: 200,
          emailText: "New email text",
        });
      expect(res.status).toBe(201);
      expect(res.body.courseName).toBe("New Course");
    });
  });

  describe("PUT /api/events/:id", () => {
    it("should update event", async () => {
      const event = await Event.create({
        courseName: "Old Course",
        venue: "Old Venue",
        date: new Date(),
        price: 100,
        emailText: "Old email text",
      });
      const res = await request(app).put(`/api/events/${event._id}`).send({
        courseName: "Updated Course",
        venue: "Updated Venue",
        date: new Date(),
        price: 150,
        emailText: "Updated email text",
      });
      expect(res.status).toBe(204);
    });
  });

  describe("DELETE /api/events/:id", () => {
    it("should delete event", async () => {
      const event = await Event.create({
        courseName: "To Delete",
        venue: "Test Venue",
        date: new Date(),
        price: 100,
        emailText: "Test email text",
      });
      const res = await request(app).delete(`/api/events/${event._id}`);
      expect(res.status).toBe(204);

      // Verify deletion
      const deleted = await Event.findById(event._id);
      expect(deleted).toBeNull();
    });
  });

  describe("POST /api/submit", () => {
    it("should reject invalid email", async () => {
      const event = await Event.create({
        courseName: "Test Course",
        venue: "Test Venue",
        date: new Date(),
        price: 100,
        emailText: "Test email text",
      });
      const res = await request(app).post("/api/submit").send({
        eventId: event._id,
        type: "person",
        name: "Test User",
        email: "invalid-email",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid email address");
    });

    it("should create submission with valid data", async () => {
      const event = await Event.create({
        courseName: "Test Course",
        venue: "Test Venue",
        date: new Date(),
        price: 100,
        emailText: "Test email text",
      });
      const res = await request(app).post("/api/submit").send({
        eventId: event._id,
        type: "person",
        name: "Test User",
        email: "test@example.com",
      });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Submission successful");
    });
  });

  describe("GET /api/submissions", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app).get("/api/submissions");
      expect(res.status).toBe(401);
    });

    it("should return submissions with valid auth token", async () => {
      const token = createAuthToken("testUserId");
      const res = await request(app)
        .get("/api/submissions")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("PATCH /api/submissions/:id", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app)
        .patch("/api/submissions/507f1f77bcf86cd799439011")
        .send({ paid: true });
      expect(res.status).toBe(401);
    });

    it("should update submission paid status", async () => {
      const event = await Event.create({
        courseName: "Test Course",
        venue: "Test Venue",
        date: new Date(),
        price: 100,
        emailText: "Test email text",
      });
      const submission = await Submission.create({
        eventId: event._id.toString(),
        type: "person",
        name: "Test User",
        email: "test@example.com",
        paid: false,
      });
      const token = createAuthToken("testUserId");
      const res = await request(app)
        .patch(`/api/submissions/${submission._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ paid: true });
      expect(res.status).toBe(200);
      expect(res.body.paid).toBe(true);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 401 for invalid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "invalid", password: "invalid" });
      expect(res.status).toBe(401);
    });

    it("should return token for valid credentials", async () => {
      // Create user directly without pre-save hook hashing (password already hashed)
      const hashedPassword = await bcrypt.hash("testpass123", 10);
      await User.collection.insertOne({
        username: "testuser@example.com",
        password: hashedPassword,
        isAdmin: true,
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "testuser@example.com", password: "testpass123" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });
  });

  describe("GET /api/auth/verify", () => {
    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/auth/verify");
      expect(res.status).toBe(401);
    });

    it("should return 200 with valid token", async () => {
      const token = createAuthToken("testUserId");
      const res = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Token is valid");
    });
  });
});
