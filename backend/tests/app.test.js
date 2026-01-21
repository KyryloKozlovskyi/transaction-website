const request = require("supertest");
const app = require("../src/app");

describe("Application Basic Tests", () => {
  describe("Health Check", () => {
    it("should return 200 for health check", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("service");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/api/unknown-route");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("status", "fail");
      expect(response.body).toHaveProperty("message", "Route not found");
    });
  });

  describe("CORS", () => {
    it("should have CORS headers", async () => {
      const response = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:3000");

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });

  describe("Security Headers", () => {
    it("should have security headers from Helmet", async () => {
      const response = await request(app).get("/health");

      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });
  });

  describe("Rate Limiting", () => {
    it("should have rate limit headers", async () => {
      const response = await request(app).get("/api/events");

      expect(response.headers).toHaveProperty("x-ratelimit-limit");
    });
  });
});
