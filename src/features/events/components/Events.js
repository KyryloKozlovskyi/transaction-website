// necessary imports
import React from "react";
import EventItem from "./EventItem";
import Row from "react-bootstrap/Row";

// Events holds list of Event objects
const Events = (props) => {
  // Check if props.myEvents is defined and is an array
  if (!props.myEvents || !Array.isArray(props.myEvents)) {
    return <div className="container mt-5">No events available</div>;
  }

  // Maps the event objects to EventItem components
  return (
    <div className="container mt-5">
      <Row className="g-6">
        {props.myEvents.map((event) => (
          <EventItem
            myEvent={event}
            key={event.id}
            ReloadData={props.ReloadData}
          />
        ))}
      </Row>
    </div>
  );
};

export default Events;
