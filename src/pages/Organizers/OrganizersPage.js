import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import HostCta from "../../layout/HostCta";
import CheckpointStory from "../../layout/CheckpointStory";
import HowSteps from "../../layout/HowSteps";
import KindsMap from "../../layout/KindsMap";
import HelpStart from "../../layout/HelpStart";
import CallToAction from "../../layout/CallToAction";
import { useContent } from "../../i18n";

// /organizers: for people who plan events. Top to bottom: the promise with the
// buttons to create an event or request a demo, beside a stack of photos
// (HostCta) → plan it in four steps (HowSteps, the same steps as the home
// page) → "Bonfiire support events": the two kinds of events, each a card with
// its map (KindsMap), and under the cards, in the same band, how
// multi-checkpoint events work, step by step along the dotted route
// (CheckpointStory, the walkthrough the home page had before) → the guides for organizers
// (HelpStart) → try it out or request a demo. The bands take turns of colour, with waves between
// them, like the home page (.sections--light-first), starting on the cream
// (.sections--cream-first). Text lives in
// src/content/<language>/organizers.json (the steps are the home page's).
const OrganizersPage = () => {
  const { hero, steps, kinds, cta } = useContent("organizers");
  const { learn } = kinds;
  const { howSteps, checkpoint } = useContent("home");
  // The walkthrough's four steps, then the rest of what organizers get (the
  // home page's "More for your Appro" items, here as steps with their own titles).
  const walkthrough = [
    ...checkpoint.steps,
    ...Object.entries(learn.titles).flatMap(([scene, title]) => {
      const item = checkpoint.more.items.find((it) => it.scene === scene);
      return item ? [{ ...item, title }] : [];
    }),
  ];
  return (
    <div className="sections--light-first sections--cream-first">
      <HostCta
        title={hero.title}
        text={hero.text}
        photos={hero.photos}
        titleAs="h1"
        titleSize="page"
        primary={hero.primary}
        demo={hero.demo}
        mailto={`mailto:${hero.email}?subject=${encodeURIComponent(
          hero.emailSubject,
        )}&body=${encodeURIComponent(hero.emailBody.join("\n"))}`}
      />
      <HowSteps {...howSteps} title={steps.title} />
      <Section>
        <Intro layout="center" title={kinds.title} />
        <KindsMap rows={kinds.rows} />
        <CheckpointStory
          title={learn.title}
          text={[]}
          steps={walkthrough}
          label={checkpoint.stepsLabel}
        />
      </Section>
      <Section className="organizer-guides">
        <HelpStart
          featured={kinds.guides.featured}
          label={kinds.guides.label}
          bigTitle
        />
      </Section>
      <CallToAction
        title={cta.title}
        text={cta.text}
        apps={false}
        helpLabel={false}
        actions={{
          primary: cta.primary,
          demo: {
            label: cta.demo,
            href: `mailto:${hero.email}?subject=${encodeURIComponent(
              hero.emailSubject,
            )}&body=${encodeURIComponent(hero.emailBody.join("\n"))}`,
          },
        }}
      />
    </div>
  );
};

export default OrganizersPage;
