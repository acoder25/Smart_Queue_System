import React, { useState } from "react";
import PageLayout from "./PageLayout";
import "./PageLayout.css";
import "./schApp.css";
import { useLocation } from "react-router-dom";

function BellIcon({ active }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={active ? "bell-icon bell-icon--active" : "bell-icon"}
    >
      <path
        d="M14 25c1.38 0 2.5-1.12 2.5-2.5h-5A2.5 2.5 0 0 0 14 25zm7-5V13c0-3.31-2.69-6-6-6V6a2 2 0 1 0-4 0v1c-3.31 0-6 2.69-6 6v7l-2 2v1h20v-1l-2-2z"
        fill={active ? "#254a8a" : "#bbb"}
      />
    </svg>
  );
}
function getUserFromStorage() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user || null;
  } catch {
    return null;
  }
}

export default function SchApp() {
  const location = useLocation();
  const { department = "", date = "", time = "" ,qlength=""} = location.state || {};
  const [name, setName] = useState("");
  const [reminder, setReminder] = useState(false);
  const user = getUserFromStorage();
  const phone_no=(user.phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!name){
       alert('Enter name of patient');
    }
    else{
      try{
        console.log(phone_no);
        console.log(name);
        console.log(date);
         const res=await fetch('http://localhost:5000/api/bookings',{
            method:'POST',
            headers:{
              'Content-Type':'application/json',
            },
            body:JSON.stringify({name,phone_no,date,time,department}),
            credentials:'include',
          });
          const data=await res.json();

          if(!res.ok){
              alert('Booking Failed');
          }
          else{
            alert("Booking confirmed!" + (reminder ? " Reminder is ON." : " Reminder is OFF."));
          }

      }
      catch(err){
          alert('Booking Failed');
      }
       

    }
    
  };

  return (
    <>
      <PageLayout
        title="Confirm Booking"
        subtitle="Confirm your details and book your slot. You can also add reminder for your appointment."
      >
        <form className="confirm-booking-form" onSubmit={handleSubmit}>
          <div className="cb-form-fields">
            <div className="cb-form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="off"
                placeholder="Enter your name"
                className="cb-input"
              />
            </div>
            <button type="submit" className="cb-btn">Confirm Booking</button>
          </div>
          <div className="cb-summary">
            <div className="cb-summary-title">Booking Summary</div>
            <div className="cb-summary-row"><span>Date:</span> <span>{date || "Not selected"}</span></div>
            <div className="cb-summary-row"><span>Department:</span> <span>{department || "Not selected"}</span></div>
            <div className="cb-summary-row"><span>Time Slot:</span> <span>{time || "Not selected"}</span></div>
            <div className="cb-summary-row cb-reminder-row">
              <span>Reminder:</span>
              <span className="cb-reminder-toggle" onClick={() => setReminder(r => !r)}>
                <BellIcon active={reminder} />
                <span className={reminder ? "cb-reminder-on" : "cb-reminder-off"}>
                  {reminder ? "On" : "Off"}
                </span>
              </span>
            </div>
          </div>
        </form>
      </PageLayout>
    </>
  );
}