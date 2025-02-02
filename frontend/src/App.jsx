// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './components/Login';
import CartPage from './components/CartPage';
import Register from './components/Register';
import EventDetails from './pages/EventDetails';  // Updated import
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './pages/Home.css'
const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/event/:id" element={<EventDetails />} /> {/* Updated route */}
            </Routes>
        </Router>
    );
};

export default App;