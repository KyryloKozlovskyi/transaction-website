import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerStyle = {
    backgroundColor: "#1E90FF",
    color: "#FFFFFF",
    padding: "2rem 0",
    borderTop: "2px solid #FFD700",
  };

  return (
    <footer className="footer mt-auto" style={footerStyle}>
      <Container>
        <Row>
          <Col className="text-center">
            <p className="mb-2">
              <strong>Transaction Portal</strong> &copy; {currentYear}
            </p>
            <p className="small mb-0" style={{ opacity: 0.9 }}>
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
