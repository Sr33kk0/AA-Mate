import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import HostReceipt from './pages/HostReceipt';
import ClientReceiptSettled from './pages/ClientReceiptSettled';
import DigitalReceipt from './pages/DigitalReceipt'; // Client Receipt (Pending)
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      {/* Container simulating mobile viewport bound context */}
      <div className="mobile-container flex flex-col relative overflow-hidden bg-black isolation">
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Detailed Pages */}
          <Route path="/host-receipt" element={<HostReceipt />} />
          <Route path="/client-receipt" element={<DigitalReceipt />} />
          <Route path="/client-receipt-settled" element={<ClientReceiptSettled />} />
          <Route path="/profile" element={<Profile />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
