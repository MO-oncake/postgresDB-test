const styles = {
  cardContainer: {
    padding: "16px",
    width: "400px",
    background: "linear-gradient(to right, blue, purple)",
    color: "white",
    borderRadius: "12px",
    boxShadow: "10px 10px 6px rgba(0, 0, 0, 1)",
    marginBottom: "30px",
  },
  dateTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  underline: {
    borderColor: "white",
    marginBottom: "8px",
  },
  ticketItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
  },
};

const TicketSelection = ({ tickets, counts, setCounts }) => {
  const handleIncrement = (tier) => {
    setCounts((prevCounts) => ({
      ...prevCounts,
      [tier]: (prevCounts[tier] || 0) + 1,
    }));
  };

  const handleDecrement = (tier) => {
    setCounts((prevCounts) => ({
      ...prevCounts,
      [tier]: Math.max(0, (prevCounts[tier] || 0) - 1), // Prevent negative values
    }));
  };

  return (
    <>
      {tickets.map((ticket, index) => {
        const { tier, price } = ticket;
        return (
          <div key={index} style={styles.cardContainer}>
            <h2 style={styles.dateTitle}>{tier}</h2>

            <div style={styles.ticketItem}>
              <span>{tier}</span>
              <span>KSH {price}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  style={{
                    color: "white",
                    border: "1px solid white",
                    padding: "4px 8px",
                    background: "transparent",
                  }}
                  onClick={() => handleDecrement(tier)}
                >
                  -
                </button>
                <span>{counts[tier] || 0}</span>
                <button
                  style={{
                    color: "white",
                    border: "1px solid white",
                    padding: "4px 8px",
                    background: "transparent",
                  }}
                  onClick={() => handleIncrement(tier)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default TicketSelection;
