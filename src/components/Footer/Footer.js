import React from "react";
import "./index.css"; // Optional CSS for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Record Keep. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
