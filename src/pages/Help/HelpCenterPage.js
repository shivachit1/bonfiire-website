import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { LuArrowRight, LuArrowUp, LuChevronRight } from "react-icons/lu";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import Tabs from "../../layout/Tabs";
import HelpTopic from "../../layout/HelpTopic";
import CallToAction from "../../layout/CallToAction";
import icons from "../../layout/icons";
import { useContent } from "../../i18n";

// Help center: a tab per audience (attending / organizing). Each tab lists its topics
// for a quick look-up, then shows every topic as its own section with its steps.
// While reading the topics, a bar sticks under the navbar: "Tab › Current topic".
// All text lives in src/content/<language>/help.json.
// Links can pick a tab (/help?tab=organizing) or jump to one topic (/help#add-cohost).
const HelpCenterPage = () => {
  const { hero, tabs, cta } = useContent("help");
  const { help: labels } = useContent("ui");
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();

  const topicId = hash.slice(1);
  const tabWithTopic = tabs.find((tab) =>
    tab.groups.some((group) => group.topics.some((topic) => topic.id === topicId)),
  );
  const activeId =
    tabWithTopic?.id || tabs.find((tab) => tab.id === params.get("tab"))?.id || tabs[0].id;
  const active = tabs.find((tab) => tab.id === activeId);
  const topicLink = (id) => `?tab=${active.id}#${id}`;
  const topics = active.groups.flatMap((group) =>
    group.topics.map((topic) => ({ ...topic, group: group.title })),
  );

  // The topic being read, shown in the bar that sticks under the navbar.
  const [currentId, setCurrentId] = useState(null);
  const indexRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries.filter((entry) => entry.isIntersecting);
        if (inView.length) setCurrentId(inView[0].target.id);
      },
      // A topic counts as current once its top passes just under the sticky bar.
      { rootMargin: "-140px 0px -55% 0px" },
    );
    document.querySelectorAll(".help-topic").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeId]);
  const current = topics.find((topic) => topic.id === currentId) || topics[0];
  const CurrentIcon = icons[current.icon];
  const toIndex = () => indexRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <Section className="page-header" width="narrow">
        <Intro eyebrow={hero.eyebrow} title={hero.title} text={[hero.text]} as="h1" />
      </Section>

      <Section>
        <div className="help-center" ref={indexRef}>
          <Tabs
            tabs={tabs}
            active={activeId}
            label={hero.title}
            onChange={(id) => navigate({ search: `?tab=${id}`, hash: "" }, { replace: true })}
          />
          <nav
            id={`panel-${active.id}`}
            className="help-index"
            role="tabpanel"
            aria-labelledby={`tab-${active.id}`}
          >
            {active.groups.map((group, index) => (
              <div key={group.title || index} className="help-group">
                {group.title && <h2 className="help-group-title">{group.title}</h2>}
                <ul className="help-index-list">
                  {group.topics.map((topic) => {
                    const Icon = icons[topic.icon];
                    return (
                      <li key={topic.id}>
                        <Link className="help-index-link" to={topicLink(topic.id)}>
                          {Icon && (
                            <span className="help-index-icon" aria-hidden="true">
                              <Icon />
                            </span>
                          )}
                          <span className="help-index-title">{topic.title}</span>
                          <LuArrowRight className="help-index-arrow" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </Section>

      <div className="help-topics">
        <div className="help-bar">
          <div className="help-bar-inner">
            <button type="button" className="help-bar-tab" onClick={toIndex}>
              {active.label}
            </button>
            <LuChevronRight className="help-bar-separator" aria-hidden="true" />
            <p className="help-bar-topic" aria-live="polite">
              {CurrentIcon && <CurrentIcon aria-hidden="true" />}
              <span>{current.title}</span>
            </p>
            <button type="button" className="help-bar-all" onClick={toIndex}>
              <LuArrowUp aria-hidden="true" />
              <span>{labels.back}</span>
            </button>
          </div>
        </div>
        {topics.map((topic) => (
          <Section key={topic.id}>
            <HelpTopic
              topic={topic}
              group={topic.group}
              labels={labels}
              link={`${window.location.origin}/help${topicLink(topic.id)}`}
            />
          </Section>
        ))}
      </div>

      <CallToAction title={cta.title} text={cta.text} />
    </>
  );
};

export default HelpCenterPage;
