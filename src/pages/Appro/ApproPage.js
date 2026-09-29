import { Navigate, useParams } from "react-router-dom";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import FeatureGrid from "../../layout/FeatureGrid";
import CallToAction from "../../layout/CallToAction";
import approMaps from "../../layout/approMaps";
import { useContent } from "../../i18n";

// One Appro in more detail (/appro/in-nature, /appro/bar-crawl, /appro/city-hopper):
// its illustrated map (the same one as on the home page), how it works, ideas for
// the stops and a few tips, then the download section.
// All text lives in src/content/<language>/appro.json.
const ApproPage = () => {
  const { slug } = useParams();
  const appro = useContent("appro");
  const { finale } = useContent("home");
  const event = Object.values(appro.events).find((e) => e.slug === slug);
  if (!event) return <Navigate to="/" replace />;

  const Map = approMaps[event.map];
  const { page } = event;

  return (
    <>
      <Section className="section--event section--appro">
        <Intro as="h1" layout="left" title={event.title} text={page.intro}>
          <Map {...event} />
        </Intro>
      </Section>

      <Section>
        <Intro title={appro.howTitle} text={event.text}>
          <FeatureGrid items={page.steps} variant="plain" />
        </Intro>
      </Section>

      <Section>
        <Intro title={page.ideas.title} text={page.ideas.text}>
          <ul className="tags tags--center">
            {page.ideas.items.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ul>
        </Intro>
      </Section>

      <Section>
        <Intro title={appro.tipsTitle}>
          <FeatureGrid items={page.tips} variant="plain" />
        </Intro>
      </Section>

      <CallToAction id="download" title={finale.title} text={finale.text} />
    </>
  );
};

export default ApproPage;
