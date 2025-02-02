// src/components/TicketPurchase.jsx
import { useState } from 'react';

const TicketPurchase = ({ event }) => {
  const [ticketType, setTicketType] = useState('regular');
  const [quantity, setQuantity] = useState(1);

  const handlePurchase = (e) => {
    e.preventDefault();
    // Handle ticket purchase logic here
    console.log(
      `Purchasing ${quantity} ${ticketType} tickets for ${event.title}`
    );
    // You would typically call an API to process the payment and create the ticket
  };

  return (
    <div className='ticket-purchase'>
      <h2>Purchase Tickets for {event.title}</h2>
      <form onSubmit={handlePurchase}>
        <label>
          Ticket Type:
          <select
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
          >
            <option value='early_bird'>
              Early Bird - ${event.early_bird_price}
            </option>
            <option value='mvp'>MVP - ${event.mvp_price}</option>
            <option value='regular'>Regular - ${event.regular_price}</option>
          </select>
        </label>
        <label>
          Quantity:
          <input
            type='number'
            min='1'
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
        <button type='submit'>Purchase</button>
      </form>
    </div>
  );
};

export default TicketPurchase;
