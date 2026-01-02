// necessary imports
import Events from "./Events";
import { useEffect, useState } from "react";
import apiClient from "../../utils/api";

const EventMenu = () => {
  // store events as JSON
  const [events, setEvents] = useState([]); // initialise events to null array

  // refresh page when events change
  useEffect(() => {
    Reload();
  }, []);

  // axios get request to get events from database
  function Reload() {
    console.log("Reloading events");
    apiClient
      .get("/api/events")
      .then((response) => {
        // log response
        console.log(response.data);
        setEvents(response.data);
      })
      .catch((error) => {
        console.log("Error loading events: ", error);
      });
  }

  return (
    // return event list
    <div>
      {/* display events */}
      <Events myEvents={events} ReloadData={Reload} />
    </div>
  );
};

export default EventMenu;
