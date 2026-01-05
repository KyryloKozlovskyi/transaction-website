import React, { useState, useEffect } from "react";
import apiClient from "../../../shared/utils/api";
import { logger, handleApiError } from "../../../shared";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";

const EventUpdate = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseName: "",
    venue: "",
    date: "",
    price: "",
    emailText: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch the event details
    const fetchEvent = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await axios.get(`${apiUrl}/api/events/${id}`);
        const eventData = response.data;
        // Format date for date input (YYYY-MM-DD)
        if (eventData.date) {
          eventData.date = new Date(eventData.date).toISOString().split("T")[0];
        }
        setFormData(eventData);
      } catch (err) {
        logger.error("Error fetching event", err, { eventId: id });
        setError(handleApiError(err, "Error fetching event details"));
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/api/events/${id}`, formData);
      logger.info("Event updated successfully", { eventId: id });
      setMessage("Event updated successfully");
      navigate("/admin"); // Redirect to admin page
    } catch (error) {
      logger.error("Error updating event", error, { eventId: id });
      setError(handleApiError(error, "Error updating event"));
    }
  };

  return (
    <Container className="mt-4">
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Course Name:</label>
          <input
            type="text"
            className="form-control"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Venue:</label>
          <input
            type="text"
            className="form-control"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date:</label>
          <input
            type="date"
            className="form-control"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Price:</label>
          <input
            type="number"
            className="form-control"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email Text:</label>
          <textarea
            className="form-control"
            name="emailText"
            value={formData.emailText}
            onChange={handleChange}
            required
            rows="4"
          ></textarea>
        </div>
        <Button variant="primary" type="submit">
          Update Event
        </Button>
      </Form>
    </Container>
  );
};

export default EventUpdate;
