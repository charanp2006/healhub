"use client";

const Card = ({ children, className = "", hover = false, padded = true, ...props }) => (
  <div
    className={`bg-background-card border border-border rounded-2xl shadow-sm ${
      padded ? "p-5" : ""
    } ${hover ? "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30" : ""} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;