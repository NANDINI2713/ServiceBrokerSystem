// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import ServiceProviderScreen from './components/ServiceProviderScreen';
import ServiceRequesterScreen from './components/ServiceRequesterScreen';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/provider" element={<ServiceProviderScreen />} />
        <Route path="/requester" element={<ServiceRequesterScreen />} />
      </Routes>
    </Router>
  );
}
