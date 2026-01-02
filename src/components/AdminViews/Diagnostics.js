import React, { useState, useEffect } from "react";
import { Container, Card, Badge } from "react-bootstrap";
import { useAdmin } from "./AdminContext";

const Diagnostics = () => {
  const { isAdmin, user } = useAdmin();
  const [backendStatus, setBackendStatus] = useState("checking...");
  const [eventsCount, setEventsCount] = useState("checking...");

  useEffect(() => {
    checkBackend();
    checkEvents();
  }, []);

  const checkBackend = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      setBackendStatus(data.status === "ok" ? "✅ Online" : "❌ Error");
    } catch (error) {
      setBackendStatus("❌ Offline");
    }
  };

  const checkEvents = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/events`);
      const data = await response.json();
      setEventsCount(`✅ ${data.length} events`);
    } catch (error) {
      setEventsCount("❌ Error loading");
    }
  };

  return (
    <Container className="mt-4">
      <h2>System Diagnostics</h2>

      <Card className="mb-3">
        <Card.Header>Authentication Status</Card.Header>
        <Card.Body>
          <p>
            <strong>Logged In:</strong>{" "}
            {user ? (
              <Badge bg="success">Yes</Badge>
            ) : (
              <Badge bg="danger">No</Badge>
            )}
          </p>
          {user && (
            <>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>User ID:</strong> {user.uid}
              </p>
            </>
          )}
          <p>
            <strong>Admin Access:</strong>{" "}
            {isAdmin ? (
              <Badge bg="success">Granted</Badge>
            ) : (
              <Badge bg="danger">Not Granted</Badge>
            )}
          </p>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Header>Backend Services</Card.Header>
        <Card.Body>
          <p>
            <strong>Backend Server:</strong> {backendStatus}
          </p>
          <p>
            <strong>Events Database:</strong> {eventsCount}
          </p>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Header>Setup Instructions</Card.Header>
        <Card.Body>
          {!user && (
            <div className="alert alert-warning">
              <strong>⚠️ Not Logged In</strong>
              <p>You need to log in first:</p>
              <ol>
                <li>Create a user in Firebase Console</li>
                <li>
                  Run: <code>cd backend && node createAdmin.js</code>
                </li>
                <li>
                  Go to <a href="/login">/login</a> page
                </li>
              </ol>
            </div>
          )}

          {user && !isAdmin && (
            <div className="alert alert-danger">
              <strong>❌ Not an Admin</strong>
              <p>You're logged in but don't have admin privileges:</p>
              <ol>
                <li>
                  Update <code>backend/.env</code> with your email
                </li>
                <li>
                  Run: <code>cd backend && node createAdmin.js</code>
                </li>
                <li>Log out and log back in</li>
              </ol>
            </div>
          )}

          {user && isAdmin && (
            <div className="alert alert-success">
              <strong>✅ All Set!</strong>
              <p>You're logged in as an admin and can now:</p>
              <ul>
                <li>Create events</li>
                <li>View submissions</li>
                <li>Manage the system</li>
              </ul>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Diagnostics;
