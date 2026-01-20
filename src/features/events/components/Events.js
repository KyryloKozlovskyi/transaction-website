import React from "react";
import EventItem from "./EventItem";
import { Container, Row, Alert } from "react-bootstrap";

const Events = (props) => {
  if (!props.myEvents || !Array.isArray(props.myEvents)) {
    return (
      <Container className="mt-5">
        <Alert variant="info" className="text-center">
          <Alert.Heading>No Events Available</Alert.Heading>
          <p className="mb-0">
            There are currently no events to display. Check back soon!
          </p>
        </Alert>
      </Container>
    );
  }

  if (props.myEvents.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="info" className="text-center">
          <Alert.Heading>No Events Yet</Alert.Heading>
          <p className="mb-0">
            No events have been created yet. Admins can create new events from
            the admin panel.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <div className="col text-center">
          <h2 className="display-2 mb-3">Available Events</h2>
          <p className="lead text-secondary">
            Browse our upcoming training courses and events
          </p>
        </div>
      </Row>
      <Row className="g-4">
        {props.myEvents.map((event) => (
          <EventItem
            myEvent={event}
            key={event.id}
            ReloadData={props.ReloadData}
          />
        ))}
      </Row>
    </Container>
  );
};

export default Events;
