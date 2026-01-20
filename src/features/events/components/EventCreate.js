import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import apiClient from "../../../shared/utils/api";
import { logger, handleApiError } from "../../../shared";
import Alert from "../../../shared/components/Alert";
import { useNavigate } from "react-router-dom";

const EventCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    courseName: "",
    venue: "",
    date: "",
    price: "",
    emailText: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post("/api/events", formData);
      logger.info("Event created successfully", { eventId: response.data.id });
      navigate("/admin");
    } catch (error) {
      logger.error("Error creating event", error);
      const errorMsg = handleApiError(
        error,
        "Failed to create event. Please try again.",
      );
      setError(errorMsg);
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
              <h1 className="display-2 mb-3">Create New Event</h1>
              <p className="lead text-secondary">
                Add a new course event to the system
              </p>
            </div>

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
                      placeholder="Enter course name"
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
                      placeholder="Enter venue location"
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
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
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
                      placeholder="Enter email notification text..."
                      required
                      className="form-control"
                    />
                    <Form.Text className="form-text">
                      This text will be sent in the confirmation email
                    </Form.Text>
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
                          Creating...
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
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                          </svg>
                          Create Event
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

export default EventCreate;
