import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-simple mt-auto">
      <Container>
        <Row>
          <Col className="text-center">
            <p className="mb-2">
              <strong>Transaction Portal</strong> &copy; {currentYear}
            </p>
            <p className="text-muted small mb-0">
              Built with React, Bootstrap, and Firebase | Secured with
              enterprise-grade protection
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
