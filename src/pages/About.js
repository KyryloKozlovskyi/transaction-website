import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const About = () => {
  return (
    <div className="main-content">
      {/* Hero Section */}
      <section className="section-hero">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-1 mb-4">About Us</h1>
              <p className="lead">
                We provide a secure, modern platform for event management and
                application submissions
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="section">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <h2 className="display-2 mb-4">Our Mission</h2>
              <p className="lead mb-4">
                To provide a seamless, secure, and user-friendly platform for
                managing event registrations and submissions.
              </p>
              <p className="text-secondary">
                We believe in simplicity without compromising on security or
                functionality. Our platform is built with modern web
                technologies and follows industry best practices to ensure your
                data is safe and your experience is smooth.
              </p>
            </Col>
            <Col lg={6}>
              <Card className="card-elevated p-4">
                <Card.Body>
                  <h5 className="mb-4">Platform Features</h5>
                  <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-start">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="text-success me-2 flex-shrink-0"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                      <span>
                        Enterprise-grade security with Helmet and CORS
                        protection
                      </span>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="text-success me-2 flex-shrink-0"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                      <span>Multi-tier rate limiting for API protection</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="text-success me-2 flex-shrink-0"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                      <span>
                        Comprehensive input validation with Joi schemas
                      </span>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="text-success me-2 flex-shrink-0"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                      <span>
                        Structured logging for monitoring and debugging
                      </span>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="text-success me-2 flex-shrink-0"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                      <span>
                        Automatic retry logic with exponential backoff
                      </span>
                    </li>
                    <li className="d-flex align-items-start">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="text-success me-2 flex-shrink-0"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                      <span>Firebase authentication and cloud storage</span>
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Technology Stack */}
      <section className="section bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-2 mb-3">Technology Stack</h2>
              <p className="lead">
                Built with modern, production-ready technologies
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={3} sm={6}>
              <Card className="text-center p-4 h-100">
                <Card.Body>
                  <h6 className="text-primary mb-2">Frontend</h6>
                  <p className="small text-secondary mb-0">
                    React 19 • Bootstrap 5
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-center p-4 h-100">
                <Card.Body>
                  <h6 className="text-primary mb-2">Backend</h6>
                  <p className="small text-secondary mb-0">Node.js • Express</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-center p-4 h-100">
                <Card.Body>
                  <h6 className="text-primary mb-2">Database</h6>
                  <p className="small text-secondary mb-0">
                    Firebase Firestore
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-center p-4 h-100">
                <Card.Body>
                  <h6 className="text-primary mb-2">Security</h6>
                  <p className="small text-secondary mb-0">
                    Helmet • Joi • Rate Limiting
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default About;
