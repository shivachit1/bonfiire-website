import { Navigate, useLocation } from "react-router-dom";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import HelpStart from "../../layout/HelpStart";
import Faq from "../../layout/Faq";
import CallToAction from "../../layout/CallToAction";
import { useContent } from "../../i18n";
import { visible } from "../../content/content";
import { findTopic } from "./helpTopics";

// Help center: two cards (participants, organizers) and the featured articles,
// each opening a docs page (HelpStart), then the frequently asked questions
// (Faq) on a light band that rises with a wave. The tabs listing every topic (HelpRoute)
// were here before; removed 2026-10-31, kept in help.json and HelpRoute.jsx. A
// topic opens on its own page (/help/:topicId, HelpTopicPage). All text lives in
// src/content/<language>/help.json. Old links to one topic (/help#add-cohost)
// open that topic's page.
const HelpCenterPage = () => {
  const { hero, start, tabs, cta } = useContent("help");
  const faq = useContent("faq");
  const faqItems = visible(faq.items);
  const { hash } = useLocation();

  const oldTopic = hash && findTopic(tabs, hash.slice(1));
  if (oldTopic) return <Navigate to={`/help/${oldTopic.topic.id}`} replace />;

  return (
    <div className="help-page">
      <Section className="section--cream page-header" width="narrow">
        <Intro title={hero.title} text={[hero.text]} as="h1" size="page" />
      </Section>

      <Section className="section--cream help-start">
        <div className="help-center">
          <HelpStart
            audiences={start.audiences}
            featured={start.featured}
            label={start.label}
          />
        </div>
      </Section>

      {faqItems.length > 0 && (
        <Section className="help-faq">
          <div className="help-center">
            <Intro layout="left" as="h2" size="item" title={faq.title}>
              <Faq items={faqItems} />
            </Intro>
          </div>
        </Section>
      )}

      <CallToAction
        title={cta.title}
        text={cta.text}
        apps={false}
        helpLabel={false}
        ask={cta.ask}
      />
    </div>
  );
};

export default HelpCenterPage;
