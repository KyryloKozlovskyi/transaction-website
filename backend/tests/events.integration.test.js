const request = require("supertest");
const app = require("./testApp");
const Event = require("../models/Event");
const jwt = require("jsonwebtoken");

// Helper to create auth token
const createAuthToken = (userId, isAdmin = true) => {
  return jwt.sign(
    { userId, isAdmin },
    process.env.JWT_SECRET || "test-secret",
    {
      expiresIn: "24h",
    }
  );
};

describe("Event API Integration Tests", () => {
  describe("Event Validation", () => {
    it("should reject event with missing required fields", async () => {
      const token = createAuthToken("testUserId");
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${token}`)
        .send({
          courseName: "Test Course",
          // Missing venue, date, price, emailText
        });
      expect(res.status).toBe(400);
    });

    it("should reject event with invalid price", async () => {
      const token = createAuthToken("testUserId");
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${token}`)
        .send({
          courseName: "Test Course",
          venue: "Test Venue",
          date: new Date(),
          price: -100, // Invalid negative price
          emailText: "Test email",
        });
      expect(res.status).toBe(400);
    });

    it("should reject event with invalid date", async () => {
      const token = createAuthToken("testUserId");
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${token}`)
        .send({
          courseName: "Test Course",
          venue: "Test Venue",
          date: "invalid-date",
          price: 100,
          emailText: "Test email",
        });
      expect(res.status).toBe(400);
    });
  });

  describe("Event Pagination and Filtering", () => {
    beforeEach(async () => {
      // Create multiple events for testing
      const events = [];
      for (let i = 1; i <= 15; i++) {
        events.push({
          courseName: `Course ${i}`,
          venue: `Venue ${i}`,
          date: new Date(Date.now() + i * 86400000), // Future dates
          price: 100 * i,
          emailText: `Email text ${i}`,
        });
      }
      await Event.insertMany(events);
    });

    it("should return paginated events", async () => {
      const res = await request(app).get("/api/events?limit=10&skip=0");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it("should filter events by date range", async () => {
      const today = new Date();
      const nextWeek = new Date(Date.now() + 7 * 86400000);

      const res = await request(app).get(
        `/api/events?startDate=${today.toISOString()}&endDate=${nextWeek.toISOString()}`
      );
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should sort events by date", async () => {
      const res = await request(app).get("/api/events?sort=date");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verify events are sorted
      if (res.body.length > 1) {
        const dates = res.body.map((e) => new Date(e.date).getTime());
        const sortedDates = [...dates].sort((a, b) => a - b);
        expect(dates).toEqual(sortedDates);
      }
    });
  });

  describe("Event Update Edge Cases", () => {
    it("should handle partial updates", async () => {
      const event = await Event.create({
        courseName: "Original Course",
        venue: "Original Venue",
        date: new Date(),
        price: 100,
        emailText: "Original email",
      });

      const res = await request(app).put(`/api/events/${event._id}`).send({
        courseName: "Updated Course",
        // Only updating courseName
      });

      expect(res.status).toBe(204);

      const updated = await Event.findById(event._id);
      expect(updated.courseName).toBe("Updated Course");
      expect(updated.venue).toBe("Original Venue"); // Should remain unchanged
    });

    it("should prevent updating to invalid values", async () => {
      const event = await Event.create({
        courseName: "Test Course",
        venue: "Test Venue",
        date: new Date(),
        price: 100,
        emailText: "Test email",
      });

      const res = await request(app).put(`/api/events/${event._id}`).send({
        price: -50, // Invalid price
      });

      expect(res.status).toBe(400);
    });
  });

  describe("Event Search", () => {
    beforeEach(async () => {
      await Event.insertMany([
        {
          courseName: "JavaScript Fundamentals",
          venue: "Dublin",
          date: new Date(),
          price: 200,
          emailText: "Learn JS basics",
        },
        {
          courseName: "Advanced React",
          venue: "Cork",
          date: new Date(),
          price: 300,
          emailText: "Master React",
        },
        {
          courseName: "Node.js Backend",
          venue: "Dublin",
          date: new Date(),
          price: 250,
          emailText: "Build APIs",
        },
      ]);
    });

    it("should search events by course name", async () => {
      const res = await request(app).get("/api/events?search=React");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].courseName).toContain("React");
    });

    it("should search events by venue", async () => {
      const res = await request(app).get("/api/events?venue=Dublin");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe("Event Deletion Cascading", () => {
    it("should handle deletion of event with submissions", async () => {
      const event = await Event.create({
        courseName: "Test Course",
        venue: "Test Venue",
        date: new Date(),
        price: 100,
        emailText: "Test email",
      });

      // Create a submission for this event
      const Submission = require("../models/Submission");
      await Submission.create({
        eventId: event._id.toString(),
        type: "person",
        name: "Test User",
        email: "test@example.com",
        paid: false,
      });

      const res = await request(app).delete(`/api/events/${event._id}`);
      expect(res.status).toBe(204);

      // Verify event is deleted
      const deletedEvent = await Event.findById(event._id);
      expect(deletedEvent).toBeNull();
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent event creation", async () => {
      const token = createAuthToken("testUserId");

      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post("/api/events")
          .set("Authorization", `Bearer ${token}`)
          .send({
            courseName: `Concurrent Course ${i}`,
            venue: "Test Venue",
            date: new Date(),
            price: 100,
            emailText: "Test email",
          })
      );

      const results = await Promise.all(promises);

      results.forEach((res) => {
        expect(res.status).toBe(201);
      });

      const events = await Event.find({});
      expect(events.length).toBe(5);
    });
  });
});
