// necessary imports
import Events from "./Events";
import { useEffect, useState } from "react";
import axios from "axios";

const EventMenu = () => {

  // store books as JSON
  const [events, setEvents] = useState([]); // initialise books to null array

  // useEffect to load books from database
  useEffect(() => {
    Reload();
  }, []);

  // axios get request to get books from database
  function Reload() {
    console.log("Reloading events");
    axios.get('http://localhost:5000/api/events')
      .then((response) => {
        // log response
        console.log(response.data.events);
        setEvents(response.data.events);
      })
      .catch((error) => {
        console.log("Error loading events: ", error);
      });
  };

  return (
    // return event list
    <div>
      {/* display events */}
      <Events myEvents={events} ReloadData={Reload} />
    </div>
  );
}

export default EventMenu;