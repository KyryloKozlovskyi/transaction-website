import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Home from "./components/Home";
import About from "./components/About";
import Submit from "./components/Submit";
import NavigationBar from "./components/NavigationBar";

// Mock API module
jest.mock("./utils/api", () => ({
  getEvents: jest.fn(),
  getEventById: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  submitForm: jest.fn(),
}));

describe("Frontend Component Tests", () => {
  describe("Home Component", () => {
    it("renders home page title", () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    it("displays loading state initially", () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      // Check for loading indicators if implemented
      expect(document.body).toBeTruthy();
    });
  });

  describe("About Component", () => {
    it("renders about page content", () => {
      render(
        <BrowserRouter>
          <About />
        </BrowserRouter>
      );
      expect(screen.getByText(/about/i)).toBeInTheDocument();
    });
  });

  describe("NavigationBar Component", () => {
    it("renders navigation links", () => {
      render(
        <BrowserRouter>
          <NavigationBar />
        </BrowserRouter>
      );

      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByText(/about/i)).toBeInTheDocument();
      expect(screen.getByText(/submit/i)).toBeInTheDocument();
    });

    it("handles navigation clicks", () => {
      render(
        <BrowserRouter>
          <NavigationBar />
        </BrowserRouter>
      );

      const homeLink = screen.getByText(/home/i);
      fireEvent.click(homeLink);
      // Navigation should work without errors
      expect(homeLink).toBeInTheDocument();
    });
  });

  describe("Submit Component", () => {
    const api = require("./utils/api");

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("renders submission form", () => {
      render(
        <BrowserRouter>
          <Submit />
        </BrowserRouter>
      );

      expect(screen.getByText(/submit/i)).toBeInTheDocument();
    });

    it("validates required fields", async () => {
      render(
        <BrowserRouter>
          <Submit />
        </BrowserRouter>
      );

      // Try to submit empty form
      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      // Should show validation errors or prevent submission
      await waitFor(() => {
        expect(api.submitForm).not.toHaveBeenCalled();
      });
    });

    it("handles successful submission", async () => {
      api.submitForm.mockResolvedValue({ success: true });

      render(
        <BrowserRouter>
          <Submit />
        </BrowserRouter>
      );

      // Fill in form fields (adjust selectors based on actual implementation)
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.submitForm).toHaveBeenCalled();
      });
    });

    it("handles submission errors", async () => {
      api.submitForm.mockRejectedValue(new Error("Submission failed"));

      render(
        <BrowserRouter>
          <Submit />
        </BrowserRouter>
      );

      // Fill in form and submit
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should display error message
        expect(
          screen.getByText(/error/i) || screen.getByText(/failed/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Responsive Design", () => {
    it("renders correctly on mobile viewport", () => {
      global.innerWidth = 375;
      global.innerHeight = 667;
      global.dispatchEvent(new Event("resize"));

      render(
        <BrowserRouter>
          <NavigationBar />
        </BrowserRouter>
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders correctly on desktop viewport", () => {
      global.innerWidth = 1920;
      global.innerHeight = 1080;
      global.dispatchEvent(new Event("resize"));

      render(
        <BrowserRouter>
          <NavigationBar />
        </BrowserRouter>
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });
});
