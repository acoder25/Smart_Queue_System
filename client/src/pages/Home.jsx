import React, { useEffect, useRef } from "react";
import "./Home.css";

export default function Home() {
  const featuresRef = useRef(null);

  useEffect(() => {
    const nodes = featuresRef.current?.querySelectorAll(".feature") ?? [];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // optionally unobserve so animation runs only once
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Queue Predictor System</h1>
          <p className="hero-sub">
            Save customers' time by estimating wait times and highlighting rush
            hours — making queues smarter and service faster.
          </p>

          <div className="hero-cta">
            <button className="btn btn-primary">Login</button>
            <button className="btn btn-outline">Register</button>
          </div>
        </div>
      </header>

      <section className="features-section">
        <h2 className="section-heading">Features</h2>

        <div className="features-column" ref={featuresRef}>
          <div className="feature card slide-left" style={{ "--delay": "0.05s" }}>
            <h3>Real-time Wait Predictions</h3>
            <p>
              Accurate and continuously updating wait-time estimates for each counter.
            </p>
          </div>

          <div className="feature card slide-right" style={{ "--delay": "0.22s" }}>
            <h3>Rush-hour Insights</h3>
            <p>
              Identify busy periods so staff and customers can plan better.
            </p>
          </div>

          <div className="feature card slide-left" style={{ "--delay": "0.40s" }}>
            <h3>Analytics Dashboard</h3>
            <p>
              Visualize trends and KPIs to optimize service and reduce queues.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
