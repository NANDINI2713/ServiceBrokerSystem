import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './loginScreen.css';

export default function LoginScreen() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:4000/login', { id, password });
      localStorage.setItem('userId', id); // ✅ Save userId after successful login
      setMessage({ type: 'success', text: response.data.message });
      navigate('/provider'); // redirect after login
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Login failed',
      });
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="User ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
  
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
  
        <p>
          Don’t have an account?{' '}
          <button onClick={() => navigate('/signup')}>Sign up</button>
        </p>
      </div>
    </div>
  );
  
}
