import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import apiClient from "../../../shared/utils/api";
import { logger, handleApiError } from "../../../shared";
import Alert from "../../../shared/components/Alert";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EventUpdate = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await axios.get(`${apiUrl}/api/events/${id}`);
        const eventData = response.data;
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
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await apiClient.put(`/api/events/${id}`, formData);
      logger.info("Event updated successfully", { eventId: id });
      setMessage("Event updated successfully!");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (error) {
      logger.error("Error updating event", error, { eventId: id });
      setError(handleApiError(error, "Error updating event"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="text-center mb-4">
              <h1 className="display-2 mb-3">Update Event</h1>
              <p className="lead text-secondary">Edit event details</p>
            </div>

            {message && (
              <Alert
                variant="success"
                message={message}
                onClose={() => setMessage("")}
              />
            )}
            {error && (
              <Alert
                variant="danger"
                message={error}
                onClose={() => setError("")}
              />
            )}

            <Card className="card-elevated">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="form-group">
                    <Form.Label className="form-label">
                      Course Name *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleChange}
                      required
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group className="form-group">
                    <Form.Label className="form-label">Venue *</Form.Label>
                    <Form.Control
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      required
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group className="form-group">
                    <Form.Label className="form-label">Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group className="form-group">
                    <Form.Label className="form-label">Price (€) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group className="form-group">
                    <Form.Label className="form-label">Email Text *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="emailText"
                      value={formData.emailText}
                      onChange={handleChange}
                      required
                      className="form-control"
                    />
                  </Form.Group>

                  <div className="d-flex gap-3 mt-4">
                    <Button
                      variant="primary"
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="flex-grow-1"
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="me-2"
                            viewBox="0 0 16 16"
                          >
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                          </svg>
                          Update Event
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => navigate("/admin")}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EventUpdate;
