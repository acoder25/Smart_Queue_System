import React from "react";
import "./PageLayout.css";

const PageLayout = ({
  title,
  subtitle,
  children,
  showHeaderActions,
  headerActions // for special pages like landing
}) => (
  <div className="page-root">
    <div className="page-header">
      <h1>{title}</h1>
      {subtitle && <div className="subtitle">{subtitle}</div>}
      {showHeaderActions && (
        <div className="header-actions">{headerActions}</div>
      )}
    </div>
    <div className="page-content">
      {children}
    </div>
  </div>
);

export default PageLayout;