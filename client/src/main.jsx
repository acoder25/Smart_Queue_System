import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home1 from './pages/Home1';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking.jsx';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home1 />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Booking" element={<Booking />}/>
    </Routes>
  </BrowserRouter>
);
