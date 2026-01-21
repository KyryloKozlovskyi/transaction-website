import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import Alert from "../../../shared/components/Alert";
import logger from "../../../shared/utils/logger";

const Submit = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    eventId: "",
    type: "person",
    name: "",
    email: "",
    file: null,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await axios.get(`${apiUrl}/api/events`);
        setEvents(response.data);
        logger.info("Events fetched for submission form", {
          count: response.data.length,
        });
      } catch (err) {
        logger.error("Events fetch error", { error: err.message });
      }
    };

    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      file: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation
    if (!formData.eventId) {
      setError("Please select a valid event");
      return;
    }
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (formData.type === "company" && !formData.file) {
      setError("PDF file is required for company submissions");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("eventId", formData.eventId);
      data.append("type", formData.type);
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (formData.file) {
        data.append("file", formData.file);
      }

      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.post(`${apiUrl}/api/submissions`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(
        response.data.message ||
          "Submission successful! We'll contact you soon.",
      );
      logger.info("Submission successful", {
        type: formData.type,
        eventId: formData.eventId,
      });

      // Reset form
      setFormData({
        eventId: "",
        type: "person",
        name: "",
        email: "",
        file: null,
      });

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "An error occurred during submission";
      setError(errorMessage);
      logger.error("Submission error", { error: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === formData.eventId);

  return (
    <div className="main-content">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Page Header */}
            <div className="text-center mb-5">
              <h1 className="display-2 mb-3">Submit Application</h1>
              <p className="lead text-secondary">
                Fill out the form below to register for an event
              </p>
            </div>

            {/* Alerts */}
            {message && (
              <Alert
                variant="success"
                message={message}
                onClose={() => setMessage("")}
                className="slide-down"
              />
            )}
            {error && (
              <Alert
                variant="danger"
                message={error}
                onClose={() => setError("")}
                className="slide-down"
              />
            )}

            {/* Form Card */}
            <Card className="card-elevated">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {/* Event Selection */}
                  <Form.Group className="form-group">
                    <Form.Label className="form-label">
                      Select Event *
                    </Form.Label>
                    <Form.Select
                      name="eventId"
                      value={formData.eventId}
                      onChange={handleChange}
                      required
                      className="form-control"
                    >
                      <option value="">Choose an event...</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.courseName} - €{event.price} (
                          {new Date(event.date).toLocaleDateString()})
                        </option>
                      ))}
                    </Form.Select>
                    {selectedEvent && (
                      <Form.Text className="form-text">
                        <svg
                          width="14"
                          height="14"
                          fill="currentColor"
                          className="me-1"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                        </svg>
                        {selectedEvent.venue}
                      </Form.Text>
                    )}
                  </Form.Group>

                  {/* Type Selection */}
                  <Form.Group className="form-group">
                    <Form.Label className="form-label">
                      Registration Type *
                    </Form.Label>
                    <Form.Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="person">Individual</option>
                      <option value="company">Company</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Name Field */}
                  <Form.Group className="form-group">
                    <Form.Label className="form-label">
                      {formData.type === "company"
                        ? "Company Name"
                        : "Full Name"}{" "}
                      *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={
                        formData.type === "company"
                          ? "Enter company name"
                          : "Enter your full name"
                      }
                      required
                      maxLength={100}
                      className="form-control"
                    />
                  </Form.Group>

                  {/* Email Field */}
                  <Form.Group className="form-group">
                    <Form.Label className="form-label">
                      {formData.type === "company"
                        ? "Company Email"
                        : "Email Address"}{" "}
                      *
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email.toLowerCase()}
                      onChange={handleChange}
                      placeholder={
                        formData.type === "company"
                          ? "company@example.com"
                          : "you@example.com"
                      }
                      required
                      className="form-control"
                    />
                    <Form.Text className="form-text">
                      We'll send confirmation to this email address
                    </Form.Text>
                  </Form.Group>

                  {/* Company-specific fields */}
                  {formData.type === "company" && (
                    <>
                      <Card className="mb-4 border-info">
                        <Card.Body className="bg-info-light">
                          <h6 className="mb-3">
                            Company Registration Requirements
                          </h6>
                          <ol className="mb-0 ps-3">
                            <li className="mb-2">
                              Download the company registration form
                            </li>
                            <li className="mb-2">Print and sign the form</li>
                            <li>Upload the signed PDF below</li>
                          </ol>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/companyform`,
                              )
                            }
                            className="mt-3"
                          >
                            <svg
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="me-1"
                              viewBox="0 0 16 16"
                            >
                              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                            </svg>
                            Download Company Form (PDF)
                          </Button>
                        </Card.Body>
                      </Card>

                      <Form.Group className="form-group">
                        <Form.Label className="form-label">
                          Upload Signed PDF *
                        </Form.Label>
                        <Form.Control
                          type="file"
                          name="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          required={formData.type === "company"}
                          className="form-control"
                        />
                        <Form.Text className="form-text">
                          Maximum file size: 5MB | Format: PDF only
                        </Form.Text>
                      </Form.Group>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="d-grid gap-2 mt-4">
                    <Button
                      variant="primary"
                      size="lg"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Submitting...
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
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                          </svg>
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      * Required fields | Your information is secure and will
                      not be shared
                    </small>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Info Card */}
            <Card className="mt-4 border-0 bg-light">
              <Card.Body className="text-center p-4">
                <p className="mb-2 text-secondary">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                  </svg>
                  <strong>Need help?</strong>
                </p>
                <p className="mb-0 small text-secondary">
                  If you encounter any issues or have questions, please contact
                  our support team.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Submit;
