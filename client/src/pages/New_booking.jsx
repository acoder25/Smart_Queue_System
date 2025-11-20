import React, { useState } from "react";
import PageLayout from "./PageLayout";
import "./PageLayout.css";
import "./New_booking.css";
import { useNavigate } from "react-router-dom";


export default function New_booking() {
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qavg,setQavg]=useState(0);
  const navigate = useNavigate();

  const handleSlotClick = (slot) => {
      if (isRush(slot.queue_length)) return; // prevent clicking red slots

      navigate("/schApp", {
        state: {
          department,
          date,
          time: slot.time,
          queue_length: slot.queue_length,
        },
      });
  };

  
  const isRush = (q) => {
      if(q>qavg){
          return true;
      }
      return false;
  };
  const findAvg=()=>{
     if(slots.length!=0){
          let summ=0;
          slots.forEach(element => {
              summ+=element.queue_length;
          });
          summ/=slots.length;
          setQavg(summ);
    }
    return;
  }

  const viewSchedule = async () => {
    if (!department || !date) return;

    setLoading(true);
    setSlots([]); 
    try {
      const res = await fetch("http://localhost:5000/api/predict/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department, date }), 
      });

      const data = await res.json();
      setSlots(data);
      findAvg();
    } 
    catch (err) {
      console.error(err);
    } 
    finally {
      setLoading(false);
    }
  };

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
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="booking-input"
            >
              <option value="" disabled>
                Select department
              </option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>

          <div className="booking-form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="booking-input"
            />
          </div>

          <button
            type="button"
            className="view-schedule-btn"
            onClick={viewSchedule}
          >
            View Schedule
          </button>
        </form>

        {loading && <p className="slots-loading">Loading prediction...</p>}

        {!loading && slots.length > 0 && (
          <section className="slots-section">
            <div className="slots-header">
              <h3>Predicted queue (9 AM – 9 PM)</h3>
              <div className="slots-legend">
                <span className="legend-box legend-box--nonrush" /> Non-rush
                <span className="legend-box legend-box--rush" /> Rush
              </div>
            </div>

            <div className="slots-grid">
              {slots.map((slot) => {
                const rush = isRush(slot.queue_length);
                return (
                  <div
                    key={slot.time}
                    className={`slot-card ${
                      rush ? "slot-card--rush" : "slot-card--nonrush"
                    }`} onClick={() => !rush && handleSlotClick(slot)}
  style={{ cursor: rush ? "not-allowed" : "pointer" }}
                  >
                    <div className="slot-time">{slot.time}</div>
                    <div className="slot-queue">
                      Queue:{" "}
                      {typeof slot.queue_length === "number"
                        ? slot.queue_length.toFixed(0)
                        : slot.queue_length}
                    </div>
                    <div className="slot-status">
                      {rush ? "Rush hour" : "Non-rush"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!loading && slots.length === 0 && department && date && (
          <p className="slots-empty">
            No prediction available for the selected date and department.
          </p>
        )}
      </PageLayout>
    </>
  );
}
