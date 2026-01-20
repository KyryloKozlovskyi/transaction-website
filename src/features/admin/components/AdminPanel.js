import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Manage Events",
      description: "Create, update, and delete course events",
      link: "/events",
      icon: (
        <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
        </svg>
      ),
    },
    {
      title: "View Submissions",
      description: "View and manage user submissions",
      link: "/records",
      icon: (
        <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm0 1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
          <path d="M1 5v6a2 2 0 0 0 2 2h6v-1H3a1 1 0 0 1-1-1V5H1z" />
        </svg>
      ),
    },
    {
      title: "Create Event",
      description: "Create a new course event",
      link: "/events/create",
      icon: (
        <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="main-content">
      <Container>
        <div className="text-center mb-5">
          <h1 className="display-2 mb-3">Admin Dashboard</h1>
          <p className="lead text-secondary">
            Manage your events and submissions
          </p>
        </div>
        <Row className="g-4">
          {cards.map((card, index) => (
            <Col key={index} md={4}>
              <Card className="card-elevated h-100 text-center">
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="text-primary mb-3">{card.icon}</div>
                  <Card.Title className="h4 mb-3">{card.title}</Card.Title>
                  <Card.Text className="text-secondary mb-4 flex-grow-1">
                    {card.description}
                  </Card.Text>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate(card.link)}
                    className="mt-auto"
                  >
                    Access
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default AdminPanel;
