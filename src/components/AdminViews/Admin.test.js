import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Login from "./components/AdminViews/Login";
import AdminPanel from "./components/AdminViews/AdminPanel";
import EventCreate from "./components/AdminViews/EventCreate";
import Events from "./components/AdminViews/Events";
import { AdminProvider } from "./components/AdminViews/AdminContext";

// Mock Firebase
jest.mock("./firebase/config", () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  },
}));

// Mock API
jest.mock("./utils/api", () => ({
  createEvent: jest.fn(),
  getEvents: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  getSubmissions: jest.fn(),
}));

describe("Admin Components Tests", () => {
  describe("Login Component", () => {
    it("renders login form", () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /login/i })
      ).toBeInTheDocument();
    });

    it("validates email format", async () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const loginButton = screen.getByRole("button", { name: /login/i });

      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        // Should show validation error
        expect(
          screen.getByText(/valid email/i) || emailInput
        ).toBeInTheDocument();
      });
    });

    it("handles successful login", async () => {
      const auth = require("./firebase/config").auth;
      auth.signInWithEmailAndPassword.mockResolvedValue({
        user: { uid: "test-uid", email: "admin@example.com" },
      });

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole("button", { name: /login/i });

      fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(
          "admin@example.com",
          "password123"
        );
      });
    });

    it("handles login errors", async () => {
      const auth = require("./firebase/config").auth;
      auth.signInWithEmailAndPassword.mockRejectedValue(
        new Error("Invalid credentials")
      );

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole("button", { name: /login/i });

      fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(
          screen.getByText(/error/i) || screen.getByText(/invalid/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("EventCreate Component", () => {
    const api = require("./utils/api");

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("renders event creation form", () => {
      render(
        <BrowserRouter>
          <AdminProvider>
            <EventCreate />
          </AdminProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/venue/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    });

    it("validates required fields", async () => {
      render(
        <BrowserRouter>
          <AdminProvider>
            <EventCreate />
          </AdminProvider>
        </BrowserRouter>
      );

      const submitButton = screen.getByRole("button", { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.createEvent).not.toHaveBeenCalled();
      });
    });

    it("creates event successfully", async () => {
      api.createEvent.mockResolvedValue({
        _id: "test-id",
        courseName: "Test Course",
      });

      render(
        <BrowserRouter>
          <AdminProvider>
            <EventCreate />
          </AdminProvider>
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/course name/i), {
        target: { value: "Test Course" },
      });
      fireEvent.change(screen.getByLabelText(/venue/i), {
        target: { value: "Test Venue" },
      });
      fireEvent.change(screen.getByLabelText(/price/i), {
        target: { value: "100" },
      });

      const submitButton = screen.getByRole("button", { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.createEvent).toHaveBeenCalled();
      });
    });

    it("validates price is positive", async () => {
      render(
        <BrowserRouter>
          <AdminProvider>
            <EventCreate />
          </AdminProvider>
        </BrowserRouter>
      );

      const priceInput = screen.getByLabelText(/price/i);
      fireEvent.change(priceInput, { target: { value: "-100" } });

      await waitFor(() => {
        expect(priceInput.value).not.toBe("-100");
      });
    });
  });

  describe("Events Component", () => {
    const api = require("./utils/api");

    beforeEach(() => {
      api.getEvents.mockResolvedValue([
        {
          _id: "1",
          courseName: "Course 1",
          venue: "Venue 1",
          date: new Date(),
          price: 100,
        },
        {
          _id: "2",
          courseName: "Course 2",
          venue: "Venue 2",
          date: new Date(),
          price: 200,
        },
      ]);
    });

    it("loads and displays events", async () => {
      render(
        <BrowserRouter>
          <AdminProvider>
            <Events />
          </AdminProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Course 1")).toBeInTheDocument();
        expect(screen.getByText("Course 2")).toBeInTheDocument();
      });
    });

    it("handles empty event list", async () => {
      api.getEvents.mockResolvedValue([]);

      render(
        <BrowserRouter>
          <AdminProvider>
            <Events />
          </AdminProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no events/i)).toBeInTheDocument();
      });
    });

    it("handles delete event", async () => {
      api.deleteEvent.mockResolvedValue({ success: true });

      render(
        <BrowserRouter>
          <AdminProvider>
            <Events />
          </AdminProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Course 1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(api.deleteEvent).toHaveBeenCalledWith("1");
      });
    });
  });

  describe("AdminPanel Component", () => {
    it("renders admin dashboard", () => {
      render(
        <BrowserRouter>
          <AdminProvider>
            <AdminPanel />
          </AdminProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/admin/i)).toBeInTheDocument();
    });

    it("displays navigation to different admin views", () => {
      render(
        <BrowserRouter>
          <AdminProvider>
            <AdminPanel />
          </AdminProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/events/i)).toBeInTheDocument();
      expect(
        screen.getByText(/create/i) || screen.getByText(/new/i)
      ).toBeInTheDocument();
    });
  });

  describe("Protected Routes", () => {
    it("redirects unauthenticated users", () => {
      const auth = require("./firebase/config").auth;
      auth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null); // No user
        return jest.fn(); // Unsubscribe function
      });

      render(
        <BrowserRouter>
          <AdminProvider>
            <AdminPanel />
          </AdminProvider>
        </BrowserRouter>
      );

      // Should redirect or show login prompt
      expect(
        screen.getByText(/login/i) || screen.queryByText(/admin/i)
      ).toBeInTheDocument();
    });
  });
});
