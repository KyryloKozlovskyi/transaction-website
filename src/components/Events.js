// necessary inputs
import React from "react";
import EventItem from "./EventItem";
import Row from "react-bootstrap/Row";


// Events holds list of Event objects
const Events = (props) => {

    // Maps the tasks to TaskItem components
  return (
    <div className="container mt-5">
      <Row className="g-6">
        {props.myEvents.map((event) => (
          <EventItem 
            myEvent={event} 
            key={event._id}
            Reload={props.ReloadData}   
          />
        ))}
      </Row>
    </div>
  );
}

export default Events;