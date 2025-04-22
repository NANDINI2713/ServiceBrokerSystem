
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './serviceRequester.css';

export default function ServiceRequesterScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showList, setShowList] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [result, setResult] = useState('');
  const [message, setMessage] = useState('');
  const [showHashBox, setShowHashBox] = useState(false);
  const [hashInput, setHashInput] = useState('');
  const [hashMethod, setHashMethod] = useState('MD5');

  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowList(false);
    setMessage('');
    setResult('');
    setShowHashBox(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const performSearch = async () => {
    try {
      const response = await axios.get('http://localhost:4000/getServices'); // no userId
      const registeredServices = response.data.services || [];

      const filtered = registeredServices.filter(service =>
        service.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filtered.length > 0) {
        setAvailableServices(filtered);
        setShowList(true);
      } else {
        setShowList(false);
        setMessage('No matching registered service found.');
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setMessage('Error retrieving services from the server.');
    }
  };

  const handleServiceSelect = async (service) => {
    setMessage('');
    setResult('');
    setShowList(false);

    if (service.serviceName === "randomNumberGenerator") {
      try {
        const response = await axios.post('http://localhost:4000/invokeService', {
          serviceName: "randomNumberGenerator",
          endpoint: "/random",
          method: "GET",
        });
        setResult(`Random Number: ${response.data.number}`);
      } catch (err) {
        console.error("Random Number Service error:", err);
        setMessage('Random Number Service request failed');
      }
    } else if (service.serviceName === "hashValueGenerator") {
      setShowHashBox(true);
    }
  };

  const handleHashSubmit = async () => {
    if (!hashInput || !hashMethod) {
      setMessage("Please provide input and hash method.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/invokeService', {
        serviceName: "hashValueGenerator",
        endpoint: "/hash",
        method: "POST",
        data: {
          input: hashInput,
          method: hashMethod,
        },
      });
      setResult(`Hashed Value: ${response.data.hash}`);
      setShowHashBox(false);
      setHashInput('');
    } catch (err) {
      console.error("Hash Service error:", err);
      setMessage('Hash Service request failed');
    }
  };

  return (
    <div className="requester-screen">
      <button className="go-provider" onClick={() => navigate('/')}>
        Back to Welcome
      </button>

      <div className="requester-container">
        <h2 className="requester-title">Service Requester</h2>

        <div className="input-group spaced">
          <label className="input-label">Search Service</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Search for a service like 'randomnum' or 'hash'"
            className="input-field enhanced-spacing"
          />
        </div>

        <div className="center-search-button">
          <button className="search-button" onClick={performSearch}>
            Search
          </button>
        </div>

        {showList && (
          <div className="services-list">
            {availableServices.map(service => (
              <div
                key={service.serviceName}
                className="service-item"
                onClick={() => handleServiceSelect(service)}
              >
                {service.displayName}
              </div>
            ))}
          </div>
        )}

        {showHashBox && (
          <div className="hash-box">
            <h4>Hash Generator</h4>
            <input
              type="text"
              className="hash-input"
              placeholder="Enter text to hash"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
            />
            <select
              className="hash-method"
              value={hashMethod}
              onChange={(e) => setHashMethod(e.target.value)}
            >
              <option>MD5</option>
              <option>SHA256</option>
              <option>SHA1</option>
            </select>
            <button className="search-button" onClick={handleHashSubmit}>Generate Hash</button>
          </div>
        )}

        {message && <p className="message error">{message}</p>}
        {result && <p className="message success">{result}</p>}
      </div>
    </div>
  );
}

