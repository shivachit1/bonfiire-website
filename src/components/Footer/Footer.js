import "./index.css";
import { NavLink } from "react-router-dom";
import { useContent } from "../../i18n";
import SocialLinks from "../../layout/SocialLinks";

// A light band at the bottom of every page, rising into the page above with a
// soft wave along its top (no line). On it: on the left one line of small links
// (terms, privacy, help, download, support), on the right the social
// accounts, and the copyright on its own line at the bottom. Stacked on
// phones.
const Footer = () => {
  const { footer } = useContent("ui");
  const social = footer.social || [];

  return (
    <div className="footer-container">
      <svg
        className="footer-wave"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 64C170 30 340 22 520 44C700 66 860 86 1040 66C1220 46 1330 30 1440 38V100H0Z" />
      </svg>
      <footer id="footer" className="footer-content">
        {/* One line of small links: terms, privacy, help, download and support */}
        <div className="footer-start">
          <NavLink className="footer-link" to="/terms">
            {footer.terms}
          </NavLink>
          <NavLink className="footer-link" to="/privacy-policy">
            {footer.privacy}
          </NavLink>
          <NavLink className="footer-link" to="/help">
            {footer.help}
          </NavLink>
          <NavLink className="footer-link" to="/download">
            {footer.download}
          </NavLink>
          <a className="footer-link" href={`mailto:${footer.supportEmail}`}>
            {footer.support}
          </a>
        </div>
        <div className="footer-end">
          {social.length > 0 && (
            <div className="footer-social">
              <SocialLinks
                listClass="footer-social-list"
                linkClass="footer-social-link"
              />
            </div>
          )}
        </div>
        {/* Last, on its own line under everything: the copyright */}
        <p className="footer-name">
          &copy; {new Date().getFullYear()} Bonfiire.io. {footer.rights}
        </p>
      </footer>
    </div>
  );
};

export default Footer;
