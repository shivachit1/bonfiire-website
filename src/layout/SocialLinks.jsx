import { FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";
import { useContent } from "../i18n";

// Bonfiire's social accounts (ui.json, footer.social: { id, label, href }),
// one icon each, opening the account in a new tab; one without a link yet
// shows as a plain icon. Used in the footer and under the home hero's app
// store buttons; `listClass` and `linkClass` style it for its place.
const SOCIAL_ICONS = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  linkedin: FaLinkedin,
};

const SocialLinks = ({ listClass, linkClass, label }) => {
  const { footer } = useContent("ui");
  const social = footer.social || [];
  if (!social.length) return null;
  return (
    <ul className={listClass} aria-label={label}>
      {social.map(({ id, label: name, href }) => {
        const Icon = SOCIAL_ICONS[id];
        const icon = Icon && <Icon aria-hidden="true" />;
        return (
          <li key={id}>
            {href ? (
              <a
                className={linkClass}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
              >
                {icon}
              </a>
            ) : (
              <span className={linkClass} role="img" aria-label={name}>
                {icon}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default SocialLinks;
