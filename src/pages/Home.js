import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="section-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-1 mb-4 fade-in">
                Welcome to{" "}
                <span className="text-gradient">Transaction Portal</span>
              </h1>
              <p className="lead mb-4 fade-in">
                Streamline your event registrations and submissions with our
                secure, enterprise-grade platform. Simple, fast, and reliable.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap fade-in">
                <Button href="/submit" variant="primary" size="lg">
                  Submit Application
                </Button>
                <Button href="/about" variant="outline-primary" size="lg">
                  Learn More
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="section">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 className="display-2 mb-3">Why Choose Us?</h2>
              <p className="lead">
                Built with modern technology and best practices for security,
                performance, and user experience
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            <Col md={4}>
              <Card className="card-elevated h-100 text-center p-4">
                <Card.Body>
                  <div className="mb-3">
                    <svg
                      width="48"
                      height="48"
                      fill="currentColor"
                      className="text-primary"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    </svg>
                  </div>
                  <h5 className="mb-3">Secure & Private</h5>
                  <p className="text-secondary">
                    Enterprise-level security with encryption, rate limiting,
                    and secure authentication
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="card-elevated h-100 text-center p-4">
                <Card.Body>
                  <div className="mb-3">
                    <svg
                      width="48"
                      height="48"
                      fill="currentColor"
                      className="text-primary"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                    </svg>
                  </div>
                  <h5 className="mb-3">Easy to Use</h5>
                  <p className="text-secondary">
                    Simple, intuitive interface designed for quick submissions
                    and efficient management
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="card-elevated h-100 text-center p-4">
                <Card.Body>
                  <div className="mb-3">
                    <svg
                      width="48"
                      height="48"
                      fill="currentColor"
                      className="text-primary"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                    </svg>
                  </div>
                  <h5 className="mb-3">Reliable</h5>
                  <p className="text-secondary">
                    Built on Firebase infrastructure with automatic retries and
                    error recovery
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="section bg-light">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-2 mb-4">Ready to Get Started?</h2>
              <p className="lead mb-4">
                Submit your application now or learn more about our services
              </p>
              <Button href="/submit" variant="primary" size="lg">
                Submit Application
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;
