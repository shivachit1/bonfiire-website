import { Link } from "react-router-dom";
import { LuDownload } from "react-icons/lu";
import Hero from "../../layout/Hero";
import BonfireScene from "../../layout/BonfireScene";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import LogoStrip from "../../layout/LogoStrip";
import approMaps from "../../layout/approMaps";
import WayMap from "../../layout/WayMap";
import ApproRail from "../../layout/ApproRail";
import HandNote from "../../layout/HandNote";
import HostScene from "../../layout/HostScene";
import GatheringShowcase from "../../layout/GatheringShowcase";
import Testimonials from "../../layout/Testimonials";
import Faq from "../../layout/Faq";
import CallToAction from "../../layout/CallToAction";
import AppLinks from "../../components/AppLinks/AppLinks";
import { useContent } from "../../i18n";
import { visible } from "../../content/content";

// Home, top to bottom: the promise (hero, friends round a bonfire) → the most popular
// Appro on its map (the page's highlight) → the three Appros, scrolled sideways →
// planning the next Appro? (download, instructions) → or keep it in one place (the
// single-location event) → why Bonfiire exists → ways to bring people together (a
// single-location or a multi-checkpoint event) → who trusts us → what people say →
// questions → planning your next event? (see how).
// One calm light background throughout; the warm colour only on the map band and the
// closing band, white behind the Appro cards.
// Section titles line up on the left, like the hero (the Appro map's is centred).
// Sections sit still (no scroll animation); small drawings drift beside them
// (`doodles`).
// Text lives in src/content/<language>/home.json (the Appro events in appro.json) and
// the list files next to them.
const HomePage = () => {
  const { hero, why, ways, hostEvent, hostAppro, onePlace, popular, appros } =
    useContent("home");
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

      {/* The most popular Appro: the page's highlight, right under the hero. On a cream
          band: its heading centred on top, then the map as wide as the content
          column. */}
      <Section id="event-types" className="section--map-feature">
        <Intro title={popular.title} text={popular.text}>
          <p className="chapter-link">
            <Link className="text-link" to={`/appro/${popularEvent.slug}`}>
              {popular.linkLabel}
            </Link>
          </p>
        </Intro>
        <PopularMap {...popularEvent} />
      </Section>

      {/* The Appros we have, on white: cards you scroll sideways, each with a live
          close-up of its map, opening its page. */}
      <Section className="section--white section--appros">
        <Intro layout="left" title={appros.title} text={appros.text}>
          <ApproRail
            events={Object.values(appro.events)}
            linkLabel={appros.linkLabel}
            dotsLabel={appros.dotsLabel}
          />
          <HandNote text={appros.quote} />
        </Intro>
      </Section>

      {/* Hosting the next Appro? On white, a cream panel (the maps' colour) as wide as
          the content column: the question, a line on how Bonfiire helps, the app
          download and the organizing guide, beside a small animated map of an Appro
          that fades into the panel. It follows the quote closely. */}
      <Section className="section--white section--host">
        <div className="host-invite">
          <Intro layout="left" title={hostAppro.title} text={hostAppro.text}>
            <p className="host-invite-actions">
              <Link className="button-primary" to={hostAppro.download.to}>
                <LuDownload aria-hidden="true" />
                {hostAppro.download.label}
              </Link>
              <Link className="text-link" to={hostAppro.instructions.to}>
                {hostAppro.instructions.label}
              </Link>
            </p>
          </Intro>
          <HostScene labels={hostAppro.sceneLabels} alt={hostAppro.sceneAlt} />
        </div>
      </Section>

      {/* Or keep it in one place: the other kind of event, shown like the Appro map
          above. On a cream band: its heading centred and a link, then a map of guests
          arriving, checking in at the entrance and filling the venue, at one kind of
          event after another (concert, house party…); the pills above it switch. */}
      <Section className="section--map-feature">
        <Intro title={onePlace.title} text={onePlace.text}>
          <p className="chapter-link">
            <Link className="text-link" to={onePlace.link.to}>
              {onePlace.link.label}
            </Link>
          </p>
        </Intro>
        <GatheringShowcase
          venues={onePlace.venues}
          labels={onePlace.map.labels}
          venuesLabel={onePlace.venuesLabel}
        />
      </Section>

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
