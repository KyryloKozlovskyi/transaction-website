import React from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import apiClient from "../../../shared/utils/api";
import logger from "../../../shared/utils/logger";

const EventItem = ({ myEvent, ReloadData }) => {
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?\n\n" +
        "This will delete all submissions associated with this event and cannot be undone.",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await apiClient.delete(`/api/events/${id}`);
      logger.info("Event deleted successfully", { eventId: id });
      ReloadData();
    } catch (err) {
      logger.error("Error deleting event", { eventId: id, error: err.message });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <Col xs={12} md={6} lg={4} className="mb-4">
      <Card className="card-elevated h-100">
        <Card.Header className="card-header-primary">
          <h5 className="mb-0 text-center">{myEvent.courseName}</h5>
        </Card.Header>

        <Card.Body className="d-flex flex-column">
          {myEvent.posterUrl && (
            <div className="text-center mb-3">
              <img
                src={myEvent.posterUrl}
                alt={myEvent.courseName}
                className="img-fluid rounded"
                style={{
                  maxHeight: "200px",
                  objectFit: "cover",
                  width: "100%",
                }}
              />
            </div>
          )}

          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <svg
                width="16"
                height="16"
                fill="currentColor"
                className="text-secondary me-2"
                viewBox="0 0 16 16"
              >
                <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z" />
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
              </svg>
              <span className="text-secondary small">
                {formatDate(myEvent.date)}
              </span>
            </div>

            <div className="d-flex align-items-center mb-2">
              <svg
                width="16"
                height="16"
                fill="currentColor"
                className="text-secondary me-2"
                viewBox="0 0 16 16"
              >
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
              </svg>
              <span className="text-secondary small">{myEvent.venue}</span>
            </div>

            {myEvent.price !== undefined && (
              <div className="mt-3">
                <Badge bg="success" className="badge">
                  {formatPrice(myEvent.price)}
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-auto">
            <div className="d-flex gap-2">
              <Link to={`/events/update/${myEvent.id}`} className="flex-fill">
                <Button variant="warning" className="w-100">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="me-1"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                    <path
                      fillRule="evenodd"
                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                    />
                  </svg>
                  Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => handleDelete(myEvent.id)}
                className="flex-fill"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="me-1"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                  <path
                    fillRule="evenodd"
                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                  />
                </svg>
                Delete
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default EventItem;
