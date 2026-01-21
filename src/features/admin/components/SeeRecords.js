import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Badge,
  Button,
  Form,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import apiClient from "../../../shared/utils/api";
import { logger, handleApiError } from "../../../shared";
import Alert from "../../../shared/components/Alert";
import axios from "axios";

const SeeRecords = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("date");
  const [events, setEvents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await axios.get(`${apiUrl}/api/events`);
        setEvents(response.data);
      } catch (err) {
        logger.error("Events fetch error", err);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await apiClient.get("/api/submissions");
        logger.info("Fetched submissions successfully", {
          count: response.data.length,
        });
        setRecords(response.data);
        setLoading(false);
      } catch (err) {
        const errorMsg = handleApiError(err, "Failed to fetch records");
        setError(errorMsg);
        setLoading(false);
        logger.error("Error fetching records", err);
      }
    };

    fetchRecords();
  }, []);

  const deleteRecord = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this record?",
      );
      if (!confirmDelete) return;

      await apiClient.delete(`/api/submissions/${id}`);
      setRecords(records.filter((record) => record.id !== id));
      logger.info("Record deleted successfully", { submissionId: id });
    } catch (err) {
      logger.error("Error deleting record", err, { submissionId: id });
    }
  };

  const downloadFile = async (id) => {
    try {
      const response = await apiClient.get(`/api/submissions/${id}/file`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "document.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      logger.info("File downloaded successfully", { submissionId: id });
    } catch (err) {
      logger.error("Error downloading file", err, { submissionId: id });
    }
  };

  const filterRecords = (records, filterBy) => {
    const filteredRecords = [...records];
    switch (filterBy) {
      case "name":
        return filteredRecords.sort((a, b) => a.name.localeCompare(b.name));
      case "type":
        return filteredRecords.sort((a, b) => a.type.localeCompare(b.type));
      case "date":
        return filteredRecords.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      case "eventId":
        return filteredRecords.sort((a, b) =>
          a.eventId.localeCompare(b.eventId),
        );
      default:
        return filteredRecords;
    }
  };

  const filterByCourse = (records, selectedCourse) => {
    if (!selectedCourse) return records;
    return records.filter((record) => record.eventId === selectedCourse);
  };

  if (loading) {
    return (
      <div className="main-content">
        <Container className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-secondary">Loading submissions...</p>
        </Container>
      </div>
    );
  }

  const filteredRecords = filterByCourse(
    filterRecords(records, filterBy),
    selectedCourse,
  );

  return (
    <div className="main-content">
      <Container>
        <div className="text-center mb-4">
          <h1 className="display-2 mb-3">Submission Records</h1>
          <p className="lead text-secondary">View and manage all submissions</p>
        </div>

        {error && (
          <Alert
            variant="danger"
            message={error}
            onClose={() => setError("")}
          />
        )}

        <Card className="card-elevated mb-4">
          <Card.Body className="p-4">
            <Row className="align-items-center g-3">
              <Col md={4}>
                <div className="d-flex align-items-center">
                  <Badge
                    bg="primary"
                    className="px-3 py-2"
                    style={{ fontSize: "1rem" }}
                  >
                    Total: {filteredRecords.length}
                  </Badge>
                </div>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="form-control"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="type">Sort by Type</option>
                  <option value="eventId">Sort by Event</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="form-control"
                >
                  <option value="">All Courses</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.courseName}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="card-elevated">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Type</th>
                  <th>Event</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>File</th>
                  <th>Submitted</th>
                  <th>Payment</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-secondary">
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <Badge
                          bg={
                            record.type === "person" ? "primary" : "secondary"
                          }
                        >
                          {record.type}
                        </Badge>
                      </td>
                      <td>
                        {
                          events.find((event) => event.id === record.eventId)
                            ?.courseName
                        }
                      </td>
                      <td>{record.name}</td>
                      <td>{record.email}</td>
                      <td>
                        {record.fileUrl ? (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => downloadFile(record.id)}
                            className="p-0"
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
                            Download
                          </Button>
                        ) : (
                          <span className="text-muted">No file</span>
                        )}
                      </td>
                      <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Form.Check
                            type="checkbox"
                            checked={record.paid}
                            onChange={async () => {
                              const confirmUpdate = window.confirm(
                                "Are you sure you want to update the payment status?",
                              );
                              if (!confirmUpdate) return;

                              try {
                                await apiClient.patch(
                                  `/api/submissions/${record.id}`,
                                  {
                                    paid: !record.paid,
                                  },
                                );
                                setRecords(
                                  records.map((r) =>
                                    r.id === record.id
                                      ? { ...r, paid: !r.paid }
                                      : r,
                                  ),
                                );
                                logger.info("Payment status updated", {
                                  submissionId: record.id,
                                });
                              } catch (err) {
                                logger.error(
                                  "Error updating payment status",
                                  err,
                                );
                              }
                            }}
                          />
                          <Badge bg={record.paid ? "success" : "danger"}>
                            {record.paid ? "Paid" : "Unpaid"}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteRecord(record.id)}
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default SeeRecords;
