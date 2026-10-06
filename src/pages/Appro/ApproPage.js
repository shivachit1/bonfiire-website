import { Navigate, useParams } from "react-router-dom";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import StepScenes from "../../layout/StepScenes";
import CallToAction from "../../layout/CallToAction";
import approMaps from "../../layout/approMaps";
import { useContent } from "../../i18n";

// One Appro in more detail (/appro/in-nature, /appro/bar-crawl, /appro/city-hopper):
// its illustrated map (the same one as on the home page), then its name, what it is
// and how it works, then the download section (its own closing text and games,
// or the home page's).
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
      <Section className="section--map-feature section--appro">
        <Map {...event} />
      </Section>

      <Section>
        <Intro
          as="h1"
          size="item"
          layout="left"
          title={event.title}
          text={page.intro}
        >
          <StepScenes
            steps={page.steps}
            labels={event.labels}
            feed={event.feed}
          />
        </Intro>
      </Section>

      <CallToAction
        id="download"
        title={page.finale?.title || finale.title}
        text={page.finale?.text || finale.text}
        games={page.finale?.games}
      />
    </>
  );
};

export default ApproPage;
