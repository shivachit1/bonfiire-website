import { Link } from "react-router-dom";
import "./layout.css";
import Section from "./Section";
import Intro from "./Intro";
import useReveal from "./useReveal";
import AppLinks from "../components/AppLinks/AppLinks";
import { useContent } from "../i18n";
import LinkLabel from "./LinkLabel";

// Closing download section: title, text, the app store buttons and a support line.
// `trust` is an optional list of short points; `link` ({ label, to }) adds a small text
// link under the buttons (e.g. "See instructions →"); `warm` puts it on a warm band;
// `apps={false}` leaves out the app store buttons; `games` is an optional list shown
// as pills that rise in one after another. `helpLabel={false}` shows the support
// email without "Need a hand?" in front (when the text above already says to ask).
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
  games = [],
  supportEmail = "support@bonfiire.io",
  helpLabel = true,
}) => {
  const { cta } = useContent("ui");
  const [gamesRef, gamesVisible] = useReveal();

  return (
    <Section
      id={id}
      width="narrow"
      doodles={doodles}
      className={warm ? "section--cream" : ""}
    >
      <Intro title={title} text={text}>
        {games.length > 0 && (
          <ul
            ref={gamesRef}
            className={`tags cta-games${gamesVisible ? " is-visible" : ""}`}
          >
            {games.map((game, i) => (
              <li key={game} style={{ "--i": i }}>
                {game}
              </li>
            ))}
          </ul>
        )}
        {apps && <AppLinks />}
        {link && (
          <p className="cta-link">
            <Link className="text-link" to={link.to}>
              <LinkLabel text={link.label} />
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
        <p className={`support-line${helpLabel ? "" : " support-line--plain"}`}>
          {helpLabel && `${cta.needHelp} `}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </p>
      </Intro>
    </Section>
  );
};

export default CallToAction;
