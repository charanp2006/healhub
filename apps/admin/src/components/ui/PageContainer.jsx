"use client";

const PageContainer = ({ children, className = "", full = false }) => (
  <div className={`w-full ${full ? "" : "px-5 sm:px-6 lg:px-8"} py-6 lg:py-8 ${className}`}>
    {children}
  </div>
);

export default PageContainer;