
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeScreen.css';

const Button = ({ children, className = "", ...props }) => (
  <button {...props} className={`welcome-button ${className}`}>
    {children}
  </button>
);

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <h1 className="welcome-title">Welcome to Service Broker</h1>
        <div className="button-group">
          <Button onClick={() => navigate("/login")}>Service Provider</Button>
          <Button onClick={() => navigate("/requester")}>Service Requester</Button>
        </div>
      </div>
    </div>
  );
}
