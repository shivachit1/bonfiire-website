import "./index.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="footer-container">
      <footer id="footer" className="footer-content">
        <div className="footer-links">
          <Link className="footer-link" to="/terms">
            Terms
          </Link>
          <Link className="footer-link" to="/privacy-policy">
            Privacy
          </Link>
          <Link className="footer-link" to="/download">
            Download
          </Link>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Bonfiire. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
