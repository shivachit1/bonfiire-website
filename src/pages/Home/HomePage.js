import { Link } from "react-router-dom";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import LogoStrip from "../../layout/LogoStrip";
import GatheringShowcase from "../../layout/GatheringShowcase";
import ApproHero from "../../layout/ApproHero";
import ServiceList from "../../layout/ServiceList";
import PartyScene from "../../layout/PartyScene";
import BlobPanel from "../../layout/BlobPanel";
import Testimonials from "../../layout/Testimonials";
import Faq from "../../layout/Faq";
import AppLinks from "../../components/AppLinks/AppLinks";
import { useContent } from "../../i18n";
import { visible } from "../../content/content";
import LinkLabel from "../../layout/LinkLabel";

// Home, top to bottom: the visitor's own Appro on its map, its title over it and
// small cards of example Appros under it → what you get when you host an Appro
// (a row of cards) → the promise (light the Bonfiire of connection) with the app
// store buttons → or keep it in one place (the single-location event) →
// planning a party in one place? (the organizing guide) →
// who trusts us → what people say → questions.
// The cream (warm) background throughout, the odd section on the light one.
// Section titles line up on the left, like the hero (the Appro map's is centred).
// Sections sit still (no scroll animation); small drawings drift beside them
// (`doodles`).
// Text lives in src/content/<language>/home.json (the Appro events in appro.json) and
// the list files next to them.
const HomePage = () => {
  const {
    hero,
    hostAppro,
    hostGathering,
    onePlace,
    popular,
    services,
  } = useContent("home");
  const appro = useContent("appro");
  // The Appros on the map up top: the visitor's own first, then taking turns.
  const featuredEvents = popular.events.map((key) => appro.events[key]);
  const partners = useContent("partners");
  const testimonials = useContent("testimonials");
  const faq = useContent("faq");

  const partnerItems = visible(partners.items);
  const testimonialItems = visible(testimonials.items);
  const faqItems = visible(faq.items);

  return (
    <div className="sections--light-first">
      {/* The top: the title and a few lines, the visitor's own Appro on its map
          (signs dropping in), and small cards of example Appros under it, each
          opening its page. On a cream band, like the navbar above it. */}
      <ApproHero
        title={popular.title}
        text={popular.text}
        next={{
          ...popular.next,
          labels: {
            ...popular.next.labels,
            swipe: onePlace.map.labels.swipe,
          },
        }}
        events={featuredEvents}
        eventsLabel={popular.eventsLabel}
        link={hostAppro.instructions}
      />

      {/* What you get when you host an Appro: on the cream, a row of cards you
          swipe or scroll sideways, each an icon, a title and a line, in the map's
          building colours */}
      <Section className="section--services">
        <Intro title={services.title}>
          <ServiceList
            items={services.items}
            layout="row"
            label={services.dotsLabel}
          />
        </Intro>
      </Section>

      {/* The promise (light the Bonfiire of connection) and the app store buttons,
          after what organizers get */}
      <Section className="section--compact section--get-app">
        <div className="get-app">
          <Intro layout="left" title={hero.title} text={[hero.text]} />
          <AppLinks />
        </div>
      </Section>

      {/* Not just Appro, keep it in one place too: the other kind of event, right
          after the app store buttons. On a cream band: a map of guests arriving,
          checking in at the entrance and filling the venue, at one kind of event
          after another (house party, birthday…), under its heading; over the map's
          bottom edge the dots that switch them and each venue's name and lines. */}
      <Section className="section--map-feature">
        <Intro title={onePlace.title} text={onePlace.text} />
        <GatheringShowcase
          venues={onePlace.venues}
          labels={onePlace.map.labels}
          venuesLabel={onePlace.venuesLabel}
        />
      </Section>

      {/* Planning a party in one place? On the cream band, a light rounded panel
          like the download one: the question, a line and the link to the
          organizing guide under them on the left, the party hat, present and
          balloons on a soft breathing blob on the right (stacked on phones). */}
      <Section className="section--compact section--get-app">
        <div className="get-app get-app--scene">
          <div className="host-invite">
            <Intro
              layout="left"
              title={hostGathering.title}
              text={hostGathering.text}
            >
              <p className="host-invite-actions">
                <Link className="text-link" to={hostGathering.instructions.to}>
                  <LinkLabel text={hostGathering.instructions.label} />
                </Link>
              </p>
            </Intro>
            <BlobPanel
              className="blob-panel--scene blob-panel--beat"
              shape="trefoil"
              beat={6}
            >
              <PartyScene alt={hostGathering.sceneAlt} />
            </BlobPanel>
          </div>
        </div>
      </Section>

      {partnerItems.length > 0 && (
        <Section className="section--compact section--cream">
          <LogoStrip title={partners.title} items={partnerItems} />
        </Section>
      )}

      {testimonialItems.length > 0 && (
        <Section className="section--cream" doodles="stories">
          <Intro title={testimonials.title}>
            <Testimonials items={testimonialItems} />
          </Intro>
        </Section>
      )}

      {faqItems.length > 0 && (
        <Section className="section--cream">
          <Intro layout="left" title={faq.title}>
            <Faq items={faqItems} />
          </Intro>
        </Section>
      )}

    </div>
  );
};

export default HomePage;
