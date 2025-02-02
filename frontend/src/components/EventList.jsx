// EventList.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./styles.css";

const EventList = ({ events = [] }) => {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to determine time category
  const getTimeCategory = (timeString) => {
    // Parse the time string into hours and minutes
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format
    if (period && period.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    }
    if (period && period.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    // Check time ranges
    if (hours >= 6 && hours < 12) {
      return 'morning';
    } else if (hours >= 12 && hours < 16) {
      return 'afternoon';
    } else if (hours >= 16 && hours < 20) {
      return 'evening';
    } else {
      return 'night';
    }
  };
  
  // Format the date into a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add any additional form submission logic here if needed
  };

  // Reset all filters to their default state
  const handleReset = () => {
    setCategory("");
    setLocation("");
    setTimeOfDay("");
  };

  // Filter the events based on the selected criteria
  const filteredEvents = events.filter((event) => {
    // Category filter - matches if no category selected or if categories match
    const matchesCategory = !category || event.category.toLowerCase() === category.toLowerCase();
    
    // Location filter - matches if no location entered or if location includes search text
    const matchesLocation = !location || event.venue.toLowerCase().includes(location.toLowerCase());
    
    // Time of day filter - matches if no time selected or if time falls within selected range
    const matchesTimeOfDay = !timeOfDay || getTimeCategory(event.time) === timeOfDay;

    // Return true only if all conditions are met
    return matchesCategory && matchesLocation && matchesTimeOfDay;
  });

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // No events message component
  const NoEventsMessage = () => (
    <div className="no-events-message">
      <i className="fas fa-calendar-times"></i>
      <p>No events match your criteria.</p>
      <p>Try adjusting your filters or check back later.</p>
    </div>
  );

  return (
    <div className="events-container">
      <form className="filter-form" onSubmit={handleSubmit}>
        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="comedy">Comedy</option>
          <option value="sport">Sport</option>
          <option value="concert">Concert</option>
        </select>

        {/* Location Filter */}
        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="filter-input"
        />

        {/* Time of Day Filter */}
        <select
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          className="filter-select"
        >
          <option value="">All Times</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="night">Night</option>
        </select>

        {/* Reset Filters Button */}
        <button
          type="button"
          onClick={handleReset}
          className="reset-button"
        >
          Reset Filters
        </button>
      </form>

      <article className="article-wrapper">
        <h1 className="E">Upcoming Events</h1>
        <div className="container-project">
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Link to={`/event/${event.id}`} key={event.id} className="project-info"> {/* Wrap event content in Link */}
                <div className="category-badge">
                  {capitalizeFirstLetter(event.category || "Uncategorized")}
                </div>
                <div className="project-image-container">
                  <img
                    src={event.image_url || "/default-event-image.jpg"}  // Use default image if event has no image
                    alt={`Image of ${event.name}`}
                    className="project-image"
                    loading="lazy"
                    // onError={(e) => {
                    //   e.target.src = "/default-event-image.jpg";  // Fallback to default if error occurs
                    //   e.target.onerror = null;
                    // }}
                  />
                </div>
                <div className="project-content">
                  <h3 className="event-title">{event.name}</h3>
                  <div className="event-description">
                    <p>{event.description || "No description available"}</p>
                  </div>
                  <div className="event-details">
                    <i className="fas fa-calendar-alt"></i>
                    {event.date && event.time ? `${event.date} @ ${event.time}` : "Date TBD"}
                  </div>
                  <div className="event-details">
                    <i className="fas fa-map-marker-alt"></i>
                    {event.venue || "Location TBD"}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <NoEventsMessage />
          )}
        </div>
      </article>
    </div>
  );
};

export default EventList;
