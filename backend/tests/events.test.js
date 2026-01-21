const request = require("supertest");
const app = require("../src/app");
const { getAdmin } = require("../src/firebase/admin");

// Mock Firebase authentication
const mockToken = "mock-admin-token";
const mockAdminUid = "mock-admin-uid";

describe("Events API", () => {
  beforeEach(() => {
    const mockAdmin = getAdmin();

    // Mock successful admin authentication
    mockAdmin.auth().verifyIdToken.mockResolvedValue({
      uid: mockAdminUid,
      email: "admin@test.com",
      admin: true,
    });

    // Mock Firestore operations
    const mockSnapshot = {
      docs: [
        {
          id: "event1",
          data: () => ({
            courseName: "Test Course",
            venue: "Test Venue",
            date: new Date("2026-12-31"),
            price: 100,
            emailText: "Test email",
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
    mockAdmin.firestore().collection().get.mockResolvedValue(mockSnapshot);
  });

  describe("GET /api/events", () => {
    it("should return all events without authentication", async () => {
      const response = await request(app).get("/api/events");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/events", () => {
    it("should require authentication", async () => {
      const newEvent = {
        courseName: "New Course",
        venue: "New Venue",
        date: "2026-12-31",
        price: 150,
        emailText: "New email text",
      };

      const response = await request(app).post("/api/events").send(newEvent);

      expect(response.status).toBe(401);
    });

    it("should create event with admin token", async () => {
      const mockAdmin = getAdmin();
      mockAdmin.firestore().collection().add.mockResolvedValue({
        id: "new-event-id",
      });

      const newEvent = {
        courseName: "New Course",
        venue: "New Venue",
        date: "2026-12-31",
        price: 150,
        emailText: "New email text",
      };

      const response = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(newEvent);

      expect(response.status).toBe(201);
    });

    it("should validate required fields", async () => {
      const invalidEvent = {
        courseName: "Test",
        // Missing required fields
      };

      const response = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(invalidEvent);

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/events/:id", () => {
    it("should require authentication", async () => {
      const response = await request(app).delete("/api/events/test-id");

      expect(response.status).toBe(401);
    });

    it("should delete event with admin token", async () => {
      const mockAdmin = getAdmin();
      mockAdmin.firestore().collection().doc().delete.mockResolvedValue({});

      const response = await request(app)
        .delete("/api/events/test-id")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });
  });
});
