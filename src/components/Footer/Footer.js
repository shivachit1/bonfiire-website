import React from "react";
import "./index.css"; // Optional CSS for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} RecordKeep. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
