// src/pages/UserProfile.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const UserProfile = () => {
    const [userTickets, setUser Tickets] = useState([]);
    const user = useSelector((state) => state.user.userInfo); // Assuming user info is stored in Redux

    useEffect(() => {
        const fetchUser Tickets = async () => {
            const response = await fetch(`/api/users/${user.id}/tickets`); // Adjust the API endpoint as needed
            const data = await response.json();
            setUser Tickets(data);
        };

        if (user) {
            fetchUser Tickets();
        }
    }, [user]);

    if (!user) {
        return <div>Please log in to view your profile.</div>;
    }

    return (
        <div>
            <h1>User Profile</h1>
            <h2>Welcome, {user.username}</h2>
            <h3>Your Tickets:</h3>
            <ul>
                {userTickets.map((ticket) => (
                    <li key={ticket.id}>
                        Event: {ticket.event.title} - Ticket Type: {ticket.ticket_type} - Purchase Date: {new Date(ticket.purchase_date).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserProfile;