import { Link } from "react-router-dom";
import "./layout.css";
import Section from "./Section";
import Intro from "./Intro";
import AppLinks from "../components/AppLinks/AppLinks";
import { useContent } from "../i18n";

// Closing download section: title, text, the app store buttons and a support line.
// `trust` is an optional list of short points; `link` ({ label, to }) adds a small text
// link under the buttons (e.g. "See instructions →"); `warm` puts it on a warm band;
// `apps={false}` leaves out the app store buttons.
// `id` lets links jump to it.
const CallToAction = ({
  id,
  doodles,
  warm,
  apps = true,
  title,
  text,
  link,
  trust = [],
  supportEmail = "support@bonfiire.io",
}) => {
  const { cta } = useContent("ui");

  return (
    <Section
      id={id}
      width="narrow"
      doodles={doodles}
      className={warm ? "section--cream" : ""}
    >
      <Intro title={title} text={text}>
        {apps && <AppLinks />}
        {link && (
          <p className="cta-link">
            <Link className="text-link" to={link.to}>
              {link.label}
            </Link>
          </p>
        )}
        {trust.length > 0 && (
          <ul className="trust-list">
            {trust.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <p className="support-line">
          {cta.needHelp} <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </p>
      </Intro>
    </Section>
  );
};

export default CallToAction;
