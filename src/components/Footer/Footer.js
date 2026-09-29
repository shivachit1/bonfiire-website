import "./index.css";
import { Link } from "react-router-dom";
import { useContent } from "../../i18n";

const Footer = () => {
  const { footer } = useContent("ui");

  return (
    <div className="footer-container">
      <footer id="footer" className="footer-content">
        <div className="footer-links">
          <Link className="footer-link" to="/features">
            {footer.features}
          </Link>
          <Link className="footer-link" to="/help">
            {footer.help}
          </Link>
          <Link className="footer-link" to="/terms">
            {footer.terms}
          </Link>
          <Link className="footer-link" to="/privacy-policy">
            {footer.privacy}
          </Link>
          <Link className="footer-link" to="/download">
            {footer.download}
          </Link>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Bonfiire. {footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
