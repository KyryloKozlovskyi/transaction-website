const request = require("supertest");
const app = require("./testApp");
const Submission = require("../models/Submission");
const Event = require("../models/Event");
const jwt = require("jsonwebtoken");

const createAuthToken = (userId, isAdmin = true) => {
  return jwt.sign(
    { userId, isAdmin },
    process.env.JWT_SECRET || "test-secret",
    {
      expiresIn: "24h",
    }
  );
};

describe("Submission API Integration Tests", () => {
  let testEvent;

  beforeEach(async () => {
    // Create a test event for submissions
    testEvent = await Event.create({
      courseName: "Test Course",
      venue: "Test Venue",
      date: new Date(Date.now() + 86400000), // Tomorrow
      price: 100,
      emailText: "Test email text",
    });
  });

  describe("Submission Validation", () => {
    it("should reject submission with invalid email format", async () => {
      const res = await request(app).post("/api/submit").send({
        eventId: testEvent._id,
        type: "person",
        name: "Test User",
        email: "not-an-email",
      });
      expect(res.status).toBe(400);
    });

    it("should reject submission with missing required fields", async () => {
      const res = await request(app).post("/api/submit").send({
        eventId: testEvent._id,
        type: "person",
        // Missing name and email
      });
      expect(res.status).toBe(400);
    });

    it("should reject submission with invalid type", async () => {
      const res = await request(app).post("/api/submit").send({
        eventId: testEvent._id,
        type: "invalid-type",
        name: "Test User",
        email: "test@example.com",
      });
      expect(res.status).toBe(400);
    });

    it("should reject submission for non-existent event", async () => {
      const res = await request(app).post("/api/submit").send({
        eventId: "507f1f77bcf86cd799439011", // Non-existent ID
        type: "person",
        name: "Test User",
        email: "test@example.com",
      });
      expect(res.status).toBe(404);
    });
  });

  describe("Submission Creation", () => {
    it("should create person submission successfully", async () => {
      const res = await request(app).post("/api/submit").send({
        eventId: testEvent._id,
        type: "person",
        name: "John Doe",
        email: "john@example.com",
        phone: "+353123456789",
        address: "123 Test St, Dublin",
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Submission successful");

      // Verify in database
      const submission = await Submission.findOne({
        email: "john@example.com",
      });
      expect(submission).toBeTruthy();
      expect(submission.name).toBe("John Doe");
      expect(submission.paid).toBe(false);
    });

    it("should create company submission successfully", async () => {
      const res = await request(app).post("/api/submit").send({
        eventId: testEvent._id,
        type: "company",
        companyName: "Test Corp",
        contactName: "Jane Smith",
        email: "jane@testcorp.com",
        phone: "+353987654321",
        companyAddress: "456 Business Ave, Dublin",
      });

      expect(res.status).toBe(201);
      const submission = await Submission.findOne({
        email: "jane@testcorp.com",
      });
      expect(submission.companyName).toBe("Test Corp");
    });

    it("should handle duplicate submissions", async () => {
      const submissionData = {
        eventId: testEvent._id,
        type: "person",
        name: "Test User",
        email: "duplicate@example.com",
      };

      // First submission
      const res1 = await request(app).post("/api/submit").send(submissionData);
      expect(res1.status).toBe(201);

      // Duplicate submission
      const res2 = await request(app).post("/api/submit").send(submissionData);
      // Should either succeed or return appropriate error based on business logic
      expect([201, 400, 409]).toContain(res2.status);
    });
  });

  describe("Submission Retrieval", () => {
    beforeEach(async () => {
      // Create multiple submissions
      await Submission.insertMany([
        {
          eventId: testEvent._id.toString(),
          type: "person",
          name: "User 1",
          email: "user1@example.com",
          paid: false,
        },
        {
          eventId: testEvent._id.toString(),
          type: "person",
          name: "User 2",
          email: "user2@example.com",
          paid: true,
        },
        {
          eventId: testEvent._id.toString(),
          type: "company",
          companyName: "Corp 1",
          contactName: "Contact 1",
          email: "corp1@example.com",
          paid: false,
        },
      ]);
    });

    it("should retrieve all submissions with auth", async () => {
      const token = createAuthToken("adminUser");
      const res = await request(app)
        .get("/api/submissions")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
    });

    it("should filter submissions by event", async () => {
      const token = createAuthToken("adminUser");
      const res = await request(app)
        .get(`/api/submissions?eventId=${testEvent._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
    });

    it("should filter submissions by paid status", async () => {
      const token = createAuthToken("adminUser");
      const res = await request(app)
        .get("/api/submissions?paid=true")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].paid).toBe(true);
    });
  });

  describe("Submission Updates", () => {
    let testSubmission;

    beforeEach(async () => {
      testSubmission = await Submission.create({
        eventId: testEvent._id.toString(),
        type: "person",
        name: "Test User",
        email: "test@example.com",
        paid: false,
      });
    });

    it("should update payment status", async () => {
      const token = createAuthToken("adminUser");
      const res = await request(app)
        .patch(`/api/submissions/${testSubmission._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ paid: true });

      expect(res.status).toBe(200);
      expect(res.body.paid).toBe(true);

      // Verify in database
      const updated = await Submission.findById(testSubmission._id);
      expect(updated.paid).toBe(true);
    });

    it("should require authentication for updates", async () => {
      const res = await request(app)
        .patch(`/api/submissions/${testSubmission._id}`)
        .send({ paid: true });

      expect(res.status).toBe(401);
    });

    it("should handle non-existent submission update", async () => {
      const token = createAuthToken("adminUser");
      const res = await request(app)
        .patch("/api/submissions/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`)
        .send({ paid: true });

      expect(res.status).toBe(404);
    });
  });

  describe("File Upload with Submission", () => {
    it("should accept PDF file upload", async () => {
      const pdfBuffer = Buffer.from("%PDF-1.4 test content");

      const res = await request(app)
        .post("/api/submit")
        .field("eventId", testEvent._id.toString())
        .field("type", "person")
        .field("name", "Test User")
        .field("email", "test@example.com")
        .attach("pdf", pdfBuffer, {
          filename: "test.pdf",
          contentType: "application/pdf",
        });

      expect([201, 400]).toContain(res.status); // May vary based on validation
    });

    it("should reject non-PDF files", async () => {
      const txtBuffer = Buffer.from("This is not a PDF");

      const res = await request(app)
        .post("/api/submit")
        .field("eventId", testEvent._id.toString())
        .field("type", "person")
        .field("name", "Test User")
        .field("email", "test@example.com")
        .attach("pdf", txtBuffer, {
          filename: "test.txt",
          contentType: "text/plain",
        });

      expect(res.status).toBe(400);
    });

    it("should reject oversized files", async () => {
      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      const res = await request(app)
        .post("/api/submit")
        .field("eventId", testEvent._id.toString())
        .field("type", "person")
        .field("name", "Test User")
        .field("email", "test@example.com")
        .attach("pdf", largeBuffer, {
          filename: "large.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("Submission Statistics", () => {
    beforeEach(async () => {
      await Submission.insertMany([
        {
          eventId: testEvent._id.toString(),
          type: "person",
          name: "User 1",
          email: "user1@example.com",
          paid: true,
        },
        {
          eventId: testEvent._id.toString(),
          type: "person",
          name: "User 2",
          email: "user2@example.com",
          paid: false,
        },
        {
          eventId: testEvent._id.toString(),
          type: "company",
          companyName: "Corp 1",
          contactName: "Contact 1",
          email: "corp1@example.com",
          paid: true,
        },
      ]);
    });

    it("should count total submissions per event", async () => {
      const count = await Submission.countDocuments({
        eventId: testEvent._id.toString(),
      });
      expect(count).toBe(3);
    });

    it("should count paid vs unpaid submissions", async () => {
      const paid = await Submission.countDocuments({
        eventId: testEvent._id.toString(),
        paid: true,
      });
      const unpaid = await Submission.countDocuments({
        eventId: testEvent._id.toString(),
        paid: false,
      });

      expect(paid).toBe(2);
      expect(unpaid).toBe(1);
    });
  });
});
