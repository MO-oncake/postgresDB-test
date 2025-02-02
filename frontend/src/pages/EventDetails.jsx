import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TicketPurchase from "../components/TicketPurchase";
import TicketSelection from "../components/TicketSelection";
import frontend_domain from "../config";

const styles = {
  container: {
    display: "flex",
    width: "85%",
    margin: "0 auto",
    padding: "20px",
    boxSizing: "border-box",
  },
  eventContainer: {
    display: "flex",
    flexDirection: "column",
  },
  imageWrapper: {
    width: "100%",
    height: "60vh",
    marginBottom: "20px",
    position: "relative",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    order: 2,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    borderRadius: "12px",
  },
  eventInfo: {
    padding: "20px",
  },
  proceedToPaymentContainer: {
    padding: "20px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#744FCA",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    textAlign: "center",
    color: "red",
  },
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await fetch(`${frontend_domain}/events/${id}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched Event Data:", data); // Debugging output

        if (!data.ticket_counts || !Array.isArray(data.ticket_counts)) {
          throw new Error("Ticket data not found in response");
        }

        // Merge ticket_counts and ticket_types
        const tickets = data.ticket_counts.map((ticket) => {
          const typeData = data.ticket_types.find(
            (t) => t.tier_name === ticket.tier
          );
          return {
            tier: ticket.tier,
            available_count: ticket.available_count,
            total_count: ticket.total_count,
            total_purchased: ticket.total_purchased,
            price: typeData ? typeData.price : 0,
          };
        });

        setEvent({
          ...data,
          tickets,
        });

        setCounts(
          tickets.reduce((acc, ticket) => ({ ...acc, [ticket.tier]: 0 }), {})
        );
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err.message);
      }
    };

    fetchEventDetail();
  }, [id]);

  const totalPrice = Object.keys(counts).reduce(
    (total, tier) =>
      total +
      counts[tier] * (event?.tickets.find((ticket) => ticket.tier === tier)?.price || 0),
    0
  );

  const handleProceedToCheckout = () => {
    console.log("Total price", totalPrice);
  };

  if (error) {
    return (
      <div style={styles.error}>
        <p>Failed to load event details: {error}</p>
        <button onClick={() => navigate(-1)} style={styles.button}>
          Go Back
        </button>
      </div>
    );
  }

  if (!event) {
    return <p>Loading...</p>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.imageWrapper}>
        <img src={event.image_url} alt={event.name} style={styles.image} />
      </div>
      <div style={styles.eventContainer}>
        <div style={styles.eventInfo}>
          <h1>{event.name}</h1>
          <p>{event.description}</p>
          <p>
            <strong>Venue:</strong> {event.venue}
          </p>
          <p>
            <strong>Date:</strong> {event.date}
          </p>
          <p>
            <strong>Time:</strong> {event.time}
          </p>

          <TicketSelection tickets={event.tickets} counts={counts} setCounts={setCounts} />
        </div>
        <div style={styles.proceedToPaymentContainer}>
          <h6>Total Price: KSh {totalPrice}</h6>
          <button onClick={handleProceedToCheckout} style={styles.button}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
