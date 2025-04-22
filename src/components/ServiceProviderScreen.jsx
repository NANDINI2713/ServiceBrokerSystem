
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './serviceProvider.css';

const Button = ({ children, className = "", ...props }) => (
  <button {...props} className={`provider-button ${className}`}>
    {children}
  </button>
);

export default function ServiceProviderScreen() {
  const [serviceName, setServiceName] = useState('');
  const [port, setPort] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState(null);
  const [services, setServices] = useState([]);
  const [showOtpPopup, setShowOtpPopup] = useState(true);
  const [storedOtp, setStoredOtp] = useState('');

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const hasGeneratedOtp = useRef(false);
  
  useEffect(() => {
    if (userId && !hasGeneratedOtp.current) {
      generateOtp(); // Only once per login
      hasGeneratedOtp.current = true;
    }
  }, []);

  useEffect(() => {
    if (otpVerified) {
      fetchServices();
    }
  }, [otpVerified]);

  const generateOtp = async () => {
    try {
      await axios.post('http://localhost:4000/generateOtp', { userId });
      console.log('OTP sent to console for user:', userId);
    } catch (err) {
      console.error('Failed to send OTP:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/getServices?userId=${userId}`);
      const serverServices = response.data.services || [];
      setServices(serverServices.map(s => ({ serviceName: s.serviceName, port: s.port })));
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  const showMessage = (text, isSuccess = true) => {
    setMessage({ text, isSuccess });
    setTimeout(() => setMessage(null), 3000);
  };

  const verifyOtpAndContinue = async () => {
    if (!otpInput) {
      showMessage("Please enter OTP to proceed", false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/verifyOtp', {
        userId,
        otp: otpInput,
      });

      if (response.data.valid) {
        setStoredOtp(otpInput);
        setOtpVerified(true);
        setShowOtpPopup(false);
        showMessage("OTP verified successfully", true);
      } else {
        showMessage("Incorrect OTP. Please try again.", false);
      }
    } catch (err) {
      showMessage("OTP verification failed", false);
    }
  };

  const isValid = () => {
    if (!serviceName || !port) {
      showMessage("Service name and port are required", false);
      return false;
    }
    return true;
  };

  const addService = async () => {
    if (!isValid()) return;
    const exists = services.find(s => s.serviceName === serviceName && s.port === port);
    if (exists) return showMessage("This service on the same port is already added.", false);

    try {
      const response = await axios.post('http://localhost:4000/addService', {
        serviceName,
        ip: '127.0.0.1',
        port: parseInt(port),
        userId,
        otp: storedOtp,
      });
      setServices([...services, { serviceName, port }]);
      showMessage(response.data.message, true);
      setServiceName('');
      setPort('');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to add service', false);
    }
  };

  const removeService = async (nameToRemove, portToRemove) => {
    try {
      const response = await axios.post('http://localhost:4000/removeService', {
        serviceName: nameToRemove,
        port: parseInt(portToRemove),
        userId,
        otp: storedOtp,
      });
      setServices(services.filter(s => !(s.serviceName === nameToRemove && s.port === portToRemove)));
      showMessage(response.data.message, true);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to remove service', false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  if (showOtpPopup) {
    return (
      <div className="otp-popup">
        <div className="otp-box">
          <h2>Enter OTP</h2>
          <input
            type="text"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            placeholder="Enter OTP from console"
            className="input-field"
          />
          <div className="center-button">
            <Button onClick={verifyOtpAndContinue}>Verify OTP</Button>
          </div>
          {message && (
            <p className={`provider-message ${message.isSuccess ? 'success' : 'error'}`}>{message.text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="provider-screen">
      <div className="top-left">
        <button className="logout-nav" onClick={handleLogout}>Logout</button>
      </div>

      <div className="provider-container">
        <h2 className="provider-title">Service Provider</h2>

        <div className="input-group">
          <label className="input-label">Service Name</label>
          <input type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="e.g., randomNumberGenerator" className="input-field" />
        </div>

        <div className="input-group">
          <label className="input-label">Port Number</label>
          <input type="text" value={port} onChange={(e) => setPort(e.target.value)} placeholder="e.g., 5001" className="input-field" />
        </div>

        <div className="center-button">
          <Button onClick={addService}>Add Service</Button>
        </div>

        {message && (
          <p className={`provider-message ${message.isSuccess ? 'success' : 'error'}`}>{message.text}</p>
        )}
      </div>

      {services.length > 0 && (
        <div className="services-list-box">
          <h3 className="list-title">Registered Services</h3>
          <div className="services-table">
            {services.map((s, index) => (
              <div key={index} className="services-row">
                <span>{s.serviceName}</span>
                <span>{s.port}</span>
                <button onClick={() => removeService(s.serviceName, s.port)} className="remove-btn">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}