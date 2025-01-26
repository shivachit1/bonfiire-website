import React from "react";
import "./index.css"; // Optional CSS for styling
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="links">
        <Link className="link" to="/terms">
          Terms
        </Link>
        <Link className="link" to="/privacy-policy">
          Privacy
        </Link>
        <Link className="link" to="/applink">
          Download
        </Link>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Bonfiire. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
