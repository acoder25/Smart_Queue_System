import React from "react";
import PageLayout from "./PageLayout";
import "./Booking.css";
import "./PageLayout.css";
import { useNavigate } from "react-router-dom";

function Booking() {
  const navigate=useNavigate();
  return (
    <PageLayout
      title="Book an Appointment"
      subtitle="Schedule, view, or review your appointments. Choose any option below to get started."
    >
      <div className="booking-cards-row">
        <div className="pg-card booking-card" tabIndex={0}>
          <h2>New Appointment</h2>
          <p>Book a new appointment by selecting department and date.</p>
          <button className="pg-btn" onClick={() => {navigate('/New_booking')}}>
            Book Now
          </button>
        </div>
        <div className="pg-card booking-card" tabIndex={0}>
          <h2 >Active Appointments</h2>
          <p>View and manage your currently active appointments.</p>
          <button className="pg-btn" onClick={() => {/* Show active appointments */}}>
            View Active
          </button>
        </div>
        <div className="pg-card booking-card" tabIndex={0}>
          <h2>Past Appointments</h2>
          <p>Review your previous appointments here.</p>
          <button className="pg-btn" onClick={() => {/* Show past appointments */}}>
            View History
          </button>
        </div>
      </div>
    </PageLayout>
  );
}

export default Booking;