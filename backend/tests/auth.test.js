const request = require("supertest");
const app = require("../src/app");
const { getAdmin } = require("../src/firebase/admin");

const mockToken = "mock-admin-token";
const mockAdminUid = "mock-admin-uid";

describe("Authentication", () => {
  describe("GET /api/auth/verify", () => {
    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/auth/verify");

      expect(response.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const mockAdmin = getAdmin();
      mockAdmin
        .auth()
        .verifyIdToken.mockRejectedValue(new Error("Invalid token"));

      const response = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("should return 403 for non-admin user", async () => {
      const mockAdmin = getAdmin();
      mockAdmin.auth().verifyIdToken.mockResolvedValue({
        uid: "user-uid",
        email: "user@test.com",
        admin: false, // Not an admin
      });

      const response = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(403);
    });

    it("should verify admin token successfully", async () => {
      const mockAdmin = getAdmin();
      mockAdmin.auth().verifyIdToken.mockResolvedValue({
        uid: mockAdminUid,
        email: "admin@test.com",
        admin: true,
      });

      const response = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("user");
    });
  });

  describe("GET /api/auth/health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/auth/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
    });
  });
});
