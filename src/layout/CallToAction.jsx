import "./layout.css";
import Section from "./Section";
import Intro from "./Intro";
import AppLinks from "../components/AppLinks/AppLinks";
import { useContent } from "../i18n";

// Closing download section. `trust` is an optional list of short points; `id` lets
// links jump to it (e.g. the home hero's "Get the app").
const CallToAction = ({
  id,
  pose,
  title,
  text,
  trust = [],
  supportEmail = "support@bonfiire.io",
}) => {
  const { cta } = useContent("ui");

  return (
    <Section id={id} width="narrow" pose={pose}>
      <Intro title={title} text={text}>
        <AppLinks />
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
