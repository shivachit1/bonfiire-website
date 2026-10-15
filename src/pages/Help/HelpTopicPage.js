import { Link, Navigate, useParams } from "react-router-dom";
import { LuArrowLeft, LuChevronRight } from "react-icons/lu";
import Section from "../../layout/Section";
import HelpTopic from "../../layout/HelpTopic";
import HelpCard from "../../layout/HelpCard";
import CallToAction from "../../layout/CallToAction";
import { useContent } from "../../i18n";
import { findTopic } from "./helpTopics";

// One help topic on its own page (/help/:topicId): a link back to the list on the
// topic's tab ("Help › its group"), the topic with its steps and screenshots, then
// the topics before and after it in the same tab. An unknown id goes back to the
// help center.
const HelpTopicPage = () => {
  const { topicId } = useParams();
  const { tabs, cta } = useContent("help");
  const { help: labels } = useContent("ui");

  const found = findTopic(tabs, topicId);
  if (!found) return <Navigate to="/help" replace />;
  const { tab, topic, previous, next } = found;

  return (
    // Keyed by topic, so going to the next topic fades the page in again.
    <div key={topic.id} className="help-page help-topic-page">
      <Section className="section--cream help-topic-section">
        <nav className="help-crumbs" aria-label={labels.topics}>
          <Link className="help-back" to={`/help?tab=${tab.id}`}>
            <LuArrowLeft aria-hidden="true" />
            <span>{labels.home}</span>
            <LuChevronRight
              className="help-crumbs-separator"
              aria-hidden="true"
            />
            <span className="help-crumbs-tab">{topic.group}</span>
          </Link>
        </nav>
        <HelpTopic
          topic={topic}
          labels={labels}
          link={`${window.location.origin}/help/${topic.id}`}
          as="h1"
        />
      </Section>

      {(previous || next) && (
        <Section className="section--cream section--compact help-more">
          <ul className="help-cards help-pager">
            {previous && (
              <li className="help-pager-previous">
                <HelpCard
                  to={`/help/${previous.id}`}
                  title={previous.title}
                  label={labels.previous}
                  back
                />
              </li>
            )}
            {next && (
              <li className="help-pager-next">
                <HelpCard
                  to={`/help/${next.id}`}
                  title={next.title}
                  label={labels.next}
                />
              </li>
            )}
          </ul>
        </Section>
      )}

      <CallToAction
        title={cta.title}
        text={cta.text}
        apps={false}
        helpLabel={false}
      />
    </div>
  );
};

export default HelpTopicPage;
