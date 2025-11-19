import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Register.css";

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    system: 'Hospital Queue Predictor System',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };
  const isValidPhone = (phone) => /^[0-9]{7,15}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError('Enter a valid phone number (digits only).');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try{
       const res=await fetch ('http://localhost:5000/api/auth/register',{
            method:'POST',
            headers:{
               'Content-Type':'application/json',
            },
            body:JSON.stringify(form),
            credentials:'include',

       });
       const data =await res.json();

       if(!res.ok){
           throw new Error(data.message || 'Registration failed');
       }
       alert('Registered successfully!');
       navigate('./login');
      
       setForm({ name: '', phone: '', password: '', system: 'Hospital Queue Predictor System' });
    } 
    catch (err) {
        setError(err.message || 'Something went wrong');
    }
    finally{
        setLoading(false);
    }

    
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <div className="register-title">Register</div>
        <form className="register-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone No</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="system">System</label>
            <select
              id="system"
              name="system"
              value={form.system}
              onChange={handleChange}
              required
            >
              <option>Hospital Queue Predictor System</option>
            </select>
          </div>
      
          {error && <div style={{ color: '#ffb4b4', textAlign: 'center' }}>{error}</div>}
          <button className="register-btn" type="submit" disabled={loading}>Register</button>
      
        </form>
      </div>
    </div>
  );
}


