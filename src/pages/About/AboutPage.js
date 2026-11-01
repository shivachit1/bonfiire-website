import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import PhotoPile from "../../layout/PhotoPile";
import AboutStory from "../../layout/AboutStory";
import VersionTimeline from "../../layout/VersionTimeline";
import CallToAction from "../../layout/CallToAction";
import { useContent } from "../../i18n";

// /about: what Bonfiire is. Top to bottom: the title and a line (the home page's
// line about the app) → the photos from student events as prints (PhotoPile,
// the home page's) → what we are building, in a few plain lines beside its title
// (AboutStory) → the versions of the app
// from the first to the latest, as in the App Store (VersionTimeline) → try it
// out or request a demo. The bands take turns of colour from the cream, with
// waves between them, like the Organizers page. Text lives in
// src/content/<language>/about.json (the photos are the home page's).
const AboutPage = () => {
  const { hero, values, versions, cta } = useContent("about");
  const { memories } = useContent("home");
  return (
    <div className="sections--light-first sections--cream-first">
      <Section width="narrow" className="about-hero">
        <Intro title={hero.title} text={[hero.text]} as="h1" size="page" />
      </Section>
      <PhotoPile
        title={memories.title}
        label={memories.photosLabel}
        photos={memories.photos}
      />
      <AboutStory title={values.title} text={values.text} />
      <VersionTimeline
        title={versions.title}
        text={versions.text}
        platforms={versions.platforms}
        platformsLabel={versions.platformsLabel}
        ask={versions.ask}
      />
      <CallToAction
        title={cta.title}
        text={cta.text}
        apps={false}
        helpLabel={false}
        actions={{
          primary: cta.primary,
          demo: {
            label: cta.demo,
            href: `mailto:${cta.email}?subject=${encodeURIComponent(
              cta.emailSubject,
            )}&body=${encodeURIComponent(cta.emailBody.join("\n"))}`,
          },
        }}
      />
    </div>
  );
};

export default AboutPage;
