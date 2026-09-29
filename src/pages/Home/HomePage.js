import { Link } from "react-router-dom";
import Hero from "../../layout/Hero";
import BonfireScene from "../../layout/BonfireScene";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import LogoStrip from "../../layout/LogoStrip";
import approMaps from "../../layout/approMaps";
import WayMap from "../../layout/WayMap";
import Testimonials from "../../layout/Testimonials";
import Faq from "../../layout/Faq";
import CallToAction from "../../layout/CallToAction";
import AppLinks from "../../components/AppLinks/AppLinks";
import { useContent } from "../../i18n";
import { visible } from "../../content/content";

// Home, top to bottom: the promise (hero, friends round a bonfire) → why Bonfiire
// exists → ways to bring people together (a single-location or a multi-checkpoint
// event) → the most popular Appro on its map (the page's highlight) → who trusts us
// → what people say → questions → planning your next event? (see how).
// One calm light background throughout; the warm colour only on the closing band.
// Section titles line up on the left, like the hero. Sections sit still (no scroll
// animation); small drawings drift beside them (`doodles`).
// Text lives in src/content/<language>/home.json (the Appro events in appro.json) and
// the list files next to them.
const HomePage = () => {
  const { hero, why, ways, hostEvent, popular } = useContent("home");
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

      {/* Why Bonfiire: a short story, plain text */}
      <Section doodles="why">
        <Intro layout="left" title={why.title} text={why.text} />
      </Section>

      {/* Ways to bring people together: the two kinds of event you can host */}
      <Section doodles="ways">
        <Intro layout="left" title={ways.title} text={ways.text}>
          <ul className="way-cards">
            {ways.items.map((way) => (
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
            ))}
          </ul>
        </Intro>
      </Section>

      {/* The most popular Appro: the page's highlight. Its heading, then the full map
          right under it. */}
      <Section id="event-types" className="section--map-head" doodles="appro">
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
      </Section>

      {partnerItems.length > 0 && (
        <Section className="section--compact">
          <LogoStrip title={partners.title} items={partnerItems} />
        </Section>
      )}

      {testimonialItems.length > 0 && (
        <Section doodles="stories">
          <Intro layout="left" title={testimonials.title}>
            <Testimonials items={testimonialItems} />
          </Intro>
        </Section>
      )}

      {faqItems.length > 0 && (
        <Section doodles="faq">
          <Intro layout="left" title={faq.title}>
            <Faq items={faqItems} />
          </Intro>
        </Section>
      )}

      {/* One ending, on a warm band: planning an event? See how. (The app store
          buttons are up in the hero.) */}
      <CallToAction
        id="download"
        warm
        apps={false}
        doodles="closing"
        title={hostEvent.title}
        text={hostEvent.text}
        link={hostEvent.link}
      />
    </div>
  );
};

export default HomePage;
