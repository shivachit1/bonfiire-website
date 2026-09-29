import { Link } from "react-router-dom";
import Hero from "../../layout/Hero";
import BonfireScene from "../../layout/BonfireScene";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import LogoStrip from "../../layout/LogoStrip";
import approMaps from "../../layout/approMaps";
import WayMap from "../../layout/WayMap";
import ScrollPose from "../../layout/ScrollPose";
import Testimonials from "../../layout/Testimonials";
import Faq from "../../layout/Faq";
import CallToAction from "../../layout/CallToAction";
import Prompt from "../../layout/Prompt";
import AppLinks from "../../components/AppLinks/AppLinks";
import { useContent } from "../../i18n";
import { visible } from "../../content/content";

// Home, top to bottom: the promise (hero, friends round a bonfire) → why Bonfiire
// exists → ways to bring people together (a single-location or a multi-checkpoint
// event) → planning to host an event? → the most popular Appro on its map → who
// trusts us → what people say → questions → download.
// Text lives in src/content/<language>/home.json (the Appro events in appro.json) and
// the list files next to them.
// Backgrounds are light throughout (cream only where asked for, like the Why box).
// Every section after the hero, and the popular map, lean alike with scrolling (`pose`).
const HomePage = () => {
  const { hero, why, ways, hostEvent, popular, finale } = useContent("home");
  const appro = useContent("appro");
  const popularEvent = appro.events[popular.event];
  const PopularMap = approMaps[popularEvent.map];
  const partners = useContent("partners");
  const testimonials = useContent("testimonials");
  const faq = useContent("faq");

  const partnerItems = visible(partners.items);
  const testimonialItems = visible(testimonials.items);
  const faqItems = visible(faq.items);

  return (
    <div className="sections--light-first">
      <Hero {...hero} media={<BonfireScene alt={hero.sceneAlt} />}>
        <AppLinks />
      </Hero>

      {/* Why Bonfiire, short, in a rounded box under the hero */}
      <Section className="section--boxed section--card" pose>
        <Intro title={why.title} text={why.text} />
      </Section>

      {/* Ways to bring people together: the two kinds of event you can host */}
      <Section pose>
        <Intro title={ways.title} text={ways.text}>
          <ul className="way-cards">
            {ways.items.map((way) => {
              return (
                <li key={way.title}>
                  <Link className="way-card" to={way.link.to}>
                    <WayMap kind={way.map} label={way.mapLabel} />
                    <span className="way-card-body">
                      <span className="way-card-title">{way.title}</span>
                      <span className="way-card-text">{way.text}</span>
                      <span className="tags">
                        {way.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </span>
                      <span className="way-card-more">{way.link.label}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Intro>
      </Section>

      {/* A question for anyone thinking of hosting, in a cream box */}
      <Prompt {...hostEvent} boxed card pose />

      {/* The most popular Appro: its heading on a rounded cream panel as wide as the
          map, with the full map right under it */}
      <Section id="event-types" className="section--map-head">
        <ScrollPose>
          <div className="map-head">
            <Intro layout="left" title={popular.title} text={popular.text}>
              <p className="chapter-link">
                <Link className="text-link" to={`/appro/${popularEvent.slug}`}>
                  {appro.learnMore}
                </Link>
              </p>
            </Intro>
          </div>
          <PopularMap {...popularEvent} />
        </ScrollPose>
      </Section>

      {partnerItems.length > 0 && (
        <Section className="section--compact" pose>
          <LogoStrip title={partners.title} items={partnerItems} />
        </Section>
      )}

      {testimonialItems.length > 0 && (
        <Section pose>
          <Intro title={testimonials.title}>
            <Testimonials items={testimonialItems} />
          </Intro>
        </Section>
      )}

      {faqItems.length > 0 && (
        <Section pose>
          <Intro title={faq.title}>
            <Faq items={faqItems} />
          </Intro>
        </Section>
      )}

      <CallToAction
        id="download"
        title={finale.title}
        text={finale.text}
        pose
      />
    </div>
  );
};

export default HomePage;
