import "./index.css";
import { NavLink } from "react-router-dom";
import { FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";
import { useContent } from "../../i18n";

// Social accounts, by id (ui.json lists them with their links; one without a
// link yet shows as a plain icon).
const SOCIAL_ICONS = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  linkedin: FaLinkedin,
};

// Like the navbar (but not sticky): on the left one line of small links
// (terms, privacy, help, download, support), on the right the social accounts, and the copyright on
// its own line at the bottom. Stacked on phones.
const Footer = () => {
  const { footer } = useContent("ui");
  const social = footer.social || [];

  return (
    <div className="footer-container">
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
              <ul className="footer-social-list">
                {social.map(({ id, label, href }) => {
                  const Icon = SOCIAL_ICONS[id];
                  const icon = Icon && <Icon aria-hidden="true" />;
                  return (
                    <li key={id}>
                      {href ? (
                        <a
                          className="footer-social-link"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                        >
                          {icon}
                        </a>
                      ) : (
                        <span
                          className="footer-social-link"
                          role="img"
                          aria-label={label}
                        >
                          {icon}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
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
