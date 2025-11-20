import React, { useState } from "react";
import PageLayout from "./PageLayout";
import "./PageLayout.css";
import "./New_booking.css";

export default function New_booking() {
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");

  return (
    <>
      <PageLayout
        title="Schedule appointment"
        subtitle="Select date and department to book appointment. You can only make booking for non-rush hours."
      >
        <form className="booking-form">
          <div className="booking-form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              required
              className="booking-input"
            >
              <option value="" disabled>Select department</option>
              <option value="neurology">Neurology</option>
              <option value="cardiology">Cardiology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="orthopedics">Orthopedics</option>
            </select>
          </div>
          <div className="booking-form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="booking-input"
            />
          </div>
          <button type="button" className="view-schedule-btn">View Schedule</button>
        </form>
      </PageLayout>
    </>
  );
}