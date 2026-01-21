const request = require("supertest");
const app = require("../src/app");
const { getAdmin } = require("../src/firebase/admin");

const mockToken = "mock-admin-token";
const mockAdminUid = "mock-admin-uid";

describe("Submissions API", () => {
  beforeEach(() => {
    const mockAdmin = getAdmin();

    // Mock admin authentication
    mockAdmin.auth().verifyIdToken.mockResolvedValue({
      uid: mockAdminUid,
      email: "admin@test.com",
      admin: true,
    });

    // Mock Firestore operations
    const mockSnapshot = {
      docs: [
        {
          id: "submission1",
          data: () => ({
            eventId: "event1",
            type: "person",
            name: "John Doe",
            email: "john@test.com",
            fileUrl: null,
            fileName: null,
            paid: false,
            createdAt: new Date(),
          }),
        },
      ],
      empty: false,
    };

    mockAdmin
      .firestore()
      .collection()
      .orderBy()
      .get.mockResolvedValue(mockSnapshot);
  });

  describe("GET /api/submissions", () => {
    it("should require authentication", async () => {
      const response = await request(app).get("/api/submissions");

      expect(response.status).toBe(401);
    });

    it("should return submissions with admin token", async () => {
      const response = await request(app)
        .get("/api/submissions")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/submissions", () => {
    it("should create submission without authentication", async () => {
      const mockAdmin = getAdmin();
      mockAdmin.firestore().collection().add.mockResolvedValue({
        id: "new-submission-id",
      });

      const newSubmission = {
        eventId: "event1",
        type: "person",
        name: "Jane Doe",
        email: "jane@test.com",
      };

      const response = await request(app)
        .post("/api/submissions")
        .send(newSubmission);

      expect(response.status).toBe(201);
    });

    it("should validate submission type", async () => {
      const invalidSubmission = {
        eventId: "event1",
        type: "invalid-type",
        name: "Test",
        email: "test@test.com",
      };

      const response = await request(app)
        .post("/api/submissions")
        .send(invalidSubmission);

      expect(response.status).toBe(400);
    });

    it("should validate email format", async () => {
      const invalidSubmission = {
        eventId: "event1",
        type: "person",
        name: "Test",
        email: "invalid-email",
      };

      const response = await request(app)
        .post("/api/submissions")
        .send(invalidSubmission);

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /api/submissions/:id", () => {
    it("should require authentication", async () => {
      const response = await request(app)
        .patch("/api/submissions/test-id")
        .send({ paid: true });

      expect(response.status).toBe(401);
    });

    it("should update submission with admin token", async () => {
      const mockAdmin = getAdmin();

      // Mock document exists
      mockAdmin
        .firestore()
        .collection()
        .doc()
        .get.mockResolvedValue({
          exists: true,
          id: "test-id",
          data: () => ({
            eventId: "event1",
            type: "person",
            name: "John Doe",
            email: "john@test.com",
            paid: false,
            createdAt: new Date(),
          }),
        });

      mockAdmin.firestore().collection().doc().update.mockResolvedValue({});

      const response = await request(app)
        .patch("/api/submissions/test-id")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ paid: true });

      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/submissions/:id/file", () => {
    it("should require authentication", async () => {
      const response = await request(app).get("/api/submissions/test-id/file");

      expect(response.status).toBe(401);
    });

    it("should return 404 if file does not exist", async () => {
      const mockAdmin = getAdmin();

      mockAdmin
        .firestore()
        .collection()
        .doc()
        .get.mockResolvedValue({
          exists: true,
          id: "test-id",
          data: () => ({
            fileUrl: null,
          }),
        });

      const response = await request(app)
        .get("/api/submissions/test-id/file")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
    });
  });
});
