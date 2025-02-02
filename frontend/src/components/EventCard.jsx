// src/components/EventCard.jsx
const EventCard = ({ event }) => {
    return (
        <div className="event-card">
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Start Time:</strong> {new Date(event.start_time).toLocaleString()}</p>
            <p><strong>Available Tickets:</strong> {event.available_tickets}</p>
            <button className="buy-button">Buy Tickets</button>
        </div>
    );
};

export default EventCard;