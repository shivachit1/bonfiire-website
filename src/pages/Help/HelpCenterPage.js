import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import Tabs from "../../layout/Tabs";
import HelpRoute from "../../layout/HelpRoute";
import CallToAction from "../../layout/CallToAction";
import { useContent } from "../../i18n";
import { findTopic } from "./helpTopics";

// Help center: a tab per audience (for participants / for organizers), each listing
// its topics grouped by task (HelpRoute). A topic opens on its own page
// (/help/:topicId, HelpTopicPage). All text lives in src/content/<language>/help.json.
// Links can pick a tab (/help?tab=organizing); old links to one topic
// (/help#add-cohost) open that topic's page.
const HelpCenterPage = () => {
  const { hero, tabs, cta } = useContent("help");
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();

  const oldTopic = hash && findTopic(tabs, hash.slice(1));
  if (oldTopic) return <Navigate to={`/help/${oldTopic.topic.id}`} replace />;

  const active = tabs.find((tab) => tab.id === params.get("tab")) || tabs[0];

  return (
    <div className="help-page">
      <Section className="section--cream page-header" width="narrow">
        <Intro title={hero.title} text={[hero.text]} as="h1" size="page" />
      </Section>

      <Section className="section--cream help-list-section">
        <div className="help-center">
          <Tabs
            variant="split"
            tabs={tabs}
            active={active.id}
            label={hero.title}
            onChange={(id) =>
              navigate({ search: `?tab=${id}` }, { replace: true })
            }
          />
          {/* Keyed by tab, so switching tabs plays the rows' rise-in again. */}
          <HelpRoute
            key={active.id}
            groups={active.groups}
            id={`panel-${active.id}`}
            labelledBy={`tab-${active.id}`}
          />
        </div>
      </Section>

      <CallToAction
        title={cta.title}
        text={cta.text}
        apps={false}
        helpLabel={false}
      />
    </div>
  );
};

export default HelpCenterPage;
