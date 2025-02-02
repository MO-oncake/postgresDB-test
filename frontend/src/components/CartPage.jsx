import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CartPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [mpesaNumber, setMpesaNumber] = useState("");

    // Example cart items (you can retrieve these from your state or API)
    const cartItems = [
        { id: 1, name: "Event Ticket 1", price: 100 },
        { id: 2, name: "Event Ticket 2", price: 150 },
    ];

    const totalAmount = cartItems.reduce((total, item) => total + item.price, 0);

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Form validation
        if (email !== confirmEmail) {
            alert("Emails do not match!");
            return;
        }

        // Simulate payment request
        try {
            console.log("Processing payment...");
            // Call your backend API here
            // e.g., await fetch('/api/payment', { method: 'POST', body: JSON.stringify({ name, email, mpesaNumber }) });

            alert("Payment successful!");
            navigate("/userProfile"); // Redirect to user profile after successful payment
        } catch (error) {
            console.error("Payment failed:", error);
            alert("Payment failed. Please try again.");
        }
    };

    return (
        <div className="container">
            <div className="cart">
                <h2>Your Cart</h2>
                <ul>
                    {cartItems.map(item => (
                        <li key={item.id}>
                            {item.name} - KSh {item.price}
                        </li>
                    ))}
                </ul>
                <div>
                    <h3>Total: KSh {totalAmount}</h3>
                </div>

                {/* Payment Form */}
                <h2>Payment Information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmEmail">Confirm Email:</label>
                        <input
                            type="email"
                            id="confirmEmail"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="mpesaNumber">MPESA Number:</label>
                        <input
                            type="text"
                            id="mpesaNumber"
                            value={mpesaNumber}
                            onChange={(e) => setMpesaNumber(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Proceed to Payment</button>
                </form>
            </div>
        </div>
    );
}

export default CartPage;
