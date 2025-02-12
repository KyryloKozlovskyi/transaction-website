
import React from 'react';
// necessary inputs
// Provides linking to other app routes.
import { Link } from 'react-router-dom';
import { useEffect } from "react";
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import { Buffer } from "buffer";
//import { Buffer } from "buffer";

const EventItem = (props) => {

    useEffect(() => {
        // debug - log events to console whenever props mount
        // or update
        console.log("Events:", props.myEvents);
    }, [props.myEvents]);

    // return event information for eventItem
    return (
        /* Bootstrap columns for browse page layout */
        <Col xs={12} sm={6} md={6} className="mb-4 px-4">
            <Card className={`h-100 p-3`}>
                <Card.Header style={
                    {
                        backgroundColor: "#f8f9fa",
                        textAlign: "center",
                        fontSize: "1.5em",
                    }
                }>{props.myEvent.courseName}</Card.Header>
                <Card.Body>
                    <p className="d-flex justify-content-center">
                        {props.myEvent.venue} ({props.myEvent.date})
                    </p>
                    <blockquote className="blockquote mb-0">
                        <div className="d-flex justify-content-center">
                            {posterUrl && (
                                <div className="d-flex justify-content-center">
                                    {/* Event image */}
                                    <img
                                        src={posterUrl}
                                        alt={props.myEvent.courseName}
                                        className="img-fluid"
                                        style={{
                                            maxWidth: "50%",
                                            height: "auto",
                                            marginBottom: "10px",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </blockquote>
                </Card.Body>
                <Card.Footer>
                    <div className="d-flex justify-content-between">
                        <Link to={"/submit/" + props.myEvent._id}>
                            <Button variant="primary">Enroll</Button>
                        </Link>
                    </div>
                </Card.Footer>
            </Card>
        </Col>

    );
}

export default EventItem;
