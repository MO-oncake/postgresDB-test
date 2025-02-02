import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCalendarXmark, faUserPlus, faCartShopping, faSearch, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Header.css';
import EventYakoLogo from '../assets/images/EventYako.png'; // Adjust the path to your image location

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const navItemClass = ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`;

    return (
        <header className="navbar">
            {/* Logo */}
            <div className="logo">
                <NavLink to="/" aria-label="Home">
                    <img src={EventYakoLogo} alt="EventYako Logo" className="logo-image" />
                </NavLink>
            </div>

            {/* Hamburger Menu */}
            <div className="hamburger" onClick={toggleMenu} aria-label="Toggle Menu">
                <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
            </div>

            {/* Main Navigation Section */}
            <div className={`nav-section ${menuOpen ? 'open' : ''}`}>
                <nav className="nav-links" aria-expanded={menuOpen}>
                    <NavLink to="/" className={navItemClass}>
                        <FontAwesomeIcon icon={faHouse} className="icon" />
                        <span>Home</span>
                    </NavLink>
                    <NavLink to="/events" className={navItemClass}>
                        <FontAwesomeIcon icon={faCalendarXmark} className="icon" />
                        <span>Events</span>
                    </NavLink>
                    <NavLink to="/login" className={navItemClass}>
                        <FontAwesomeIcon icon={faUserPlus} className="icon" />
                        <span>Login</span>
                    </NavLink>
                    <NavLink to="/cart" className={navItemClass}>
                        <FontAwesomeIcon icon={faCartShopping} className="icon" />
                        <span>Cart</span>
                    </NavLink>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
