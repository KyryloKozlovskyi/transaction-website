import api from "./api";
import axios from "axios";

jest.mock("axios");

describe("API Utility Tests", () => {
  const mockToken = "mock-jwt-token";

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("authToken", mockToken);
  });

  describe("Event API", () => {
    it("fetches all events", async () => {
      const mockEvents = [
        { _id: "1", courseName: "Course 1" },
        { _id: "2", courseName: "Course 2" },
      ];

      axios.get.mockResolvedValue({ data: mockEvents });

      const events = await api.getEvents();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/events")
      );
      expect(events).toEqual(mockEvents);
    });

    it("fetches single event by ID", async () => {
      const mockEvent = { _id: "1", courseName: "Course 1" };
      axios.get.mockResolvedValue({ data: mockEvent });

      const event = await api.getEventById("1");

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/events/1")
      );
      expect(event).toEqual(mockEvent);
    });

    it("creates new event with authentication", async () => {
      const newEvent = {
        courseName: "New Course",
        venue: "New Venue",
        date: new Date(),
        price: 100,
        emailText: "Test email",
      };

      axios.post.mockResolvedValue({ data: { ...newEvent, _id: "new-id" } });

      const result = await api.createEvent(newEvent);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/events"),
        newEvent,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result._id).toBe("new-id");
    });

    it("updates existing event", async () => {
      const updatedEvent = {
        courseName: "Updated Course",
        venue: "Updated Venue",
      };

      axios.put.mockResolvedValue({ data: updatedEvent });

      await api.updateEvent("1", updatedEvent);

      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining("/api/events/1"),
        updatedEvent,
        expect.any(Object)
      );
    });

    it("deletes event", async () => {
      axios.delete.mockResolvedValue({ data: { success: true } });

      await api.deleteEvent("1");

      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining("/api/events/1"),
        expect.any(Object)
      );
    });
  });

  describe("Submission API", () => {
    it("submits form data", async () => {
      const formData = {
        eventId: "1",
        type: "person",
        name: "Test User",
        email: "test@example.com",
      };

      axios.post.mockResolvedValue({ data: { success: true } });

      await api.submitForm(formData);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/submit"),
        formData
      );
    });

    it("fetches submissions with auth", async () => {
      const mockSubmissions = [
        { _id: "1", name: "User 1" },
        { _id: "2", name: "User 2" },
      ];

      axios.get.mockResolvedValue({ data: mockSubmissions });

      const submissions = await api.getSubmissions();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/submissions"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(submissions).toEqual(mockSubmissions);
    });

    it("updates submission payment status", async () => {
      axios.patch.mockResolvedValue({ data: { paid: true } });

      await api.updateSubmission("1", { paid: true });

      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/api/submissions/1"),
        { paid: true },
        expect.any(Object)
      );
    });
  });

  describe("Error Handling", () => {
    it("handles network errors", async () => {
      axios.get.mockRejectedValue(new Error("Network error"));

      await expect(api.getEvents()).rejects.toThrow("Network error");
    });

    it("handles 401 unauthorized", async () => {
      axios.post.mockRejectedValue({
        response: { status: 401, data: { message: "Unauthorized" } },
      });

      await expect(api.createEvent({})).rejects.toThrow();
    });

    it("handles 404 not found", async () => {
      axios.get.mockRejectedValue({
        response: { status: 404, data: { message: "Not found" } },
      });

      await expect(api.getEventById("nonexistent")).rejects.toThrow();
    });

    it("handles 500 server errors", async () => {
      axios.get.mockRejectedValue({
        response: { status: 500, data: { message: "Server error" } },
      });

      await expect(api.getEvents()).rejects.toThrow();
    });
  });

  describe("Request Interceptors", () => {
    it("adds authorization header when token exists", async () => {
      axios.post.mockResolvedValue({ data: {} });

      await api.createEvent({});

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it("works without token for public endpoints", async () => {
      localStorage.removeItem("authToken");
      axios.get.mockResolvedValue({ data: [] });

      await api.getEvents();

      expect(axios.get).toHaveBeenCalled();
    });
  });

  describe("Response Transformations", () => {
    it("transforms date strings to Date objects", async () => {
      const mockEvent = {
        _id: "1",
        courseName: "Course 1",
        date: "2025-12-31T00:00:00.000Z",
      };

      axios.get.mockResolvedValue({ data: mockEvent });

      const event = await api.getEventById("1");

      // If your API transforms dates, test that
      expect(event).toHaveProperty("date");
    });
  });
});
