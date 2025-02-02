import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import "./App.css";
import frontend_domain from '../config';

const Login = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [isLogin, setIsLogin] = useState(true); // State to toggle between forms
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ username: "", email: "", password: "", role: "user" }); // Changed "name" to "username"
  const [message, setMessage] = useState(""); // To show success or error messages

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    // Sending login data to the Flask backend
    const response = await fetch(`${frontend_domain}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    if (response.ok) {
      const data = await response.json();
      setMessage(`Logged in as: ${data.user.username}`); // Updated to show "username"
      // Redirect to Home page after successful login
      console.log("Redirection to home..."); // Add this log
      navigate("/");
    } else {
      setMessage("Login failed. Please check your credentials.");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    // Sending signup data to the Flask backend
    const response = await fetch(`${frontend_domain}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
    });

    if (response.ok) {
      const data = await response.json();
      setMessage(`Welcome, ${data.user.username}! Your account has been created.`); // Updated to show "username"
      // Redirect to Home page after successful signup
      console.log("Redirection to home..."); // Add this log
      navigate("/");
    } else {
      setMessage("Registration failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        {isLogin ? (
          <>
            <h1 className="title">Login</h1>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="submit-button">
                Login
              </button>
            </form>
            <p className="toggle-text">
              No account?{" "}
              <button className="toggle-button" onClick={() => setIsLogin(false)}>
                Register here
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 className="title">Sign Up</h1>
            <form onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label htmlFor="signup-username">Full Name</label>
                <input
                  type="text"
                  id="signup-username"
                  name="username"  // Changed name to "username"
                  value={signupData.username}  // Changed name to "username"
                  onChange={handleSignupChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  type="password"
                  id="signup-password"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                  placeholder="Create a password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={signupData.role}
                  onChange={handleSignupChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="organiser">Organiser</option>
                </select>
              </div>
              <button type="submit" className="submit-button">
                Sign Up
              </button>
            </form>
            <p className="toggle-text">
              Already have an account?{" "}
              <button className="toggle-button" onClick={() => setIsLogin(true)}>
                Login here
              </button>
            </p>
          </>
        )}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
