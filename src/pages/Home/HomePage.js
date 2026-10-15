import { Link } from "react-router-dom";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import LogoStrip from "../../layout/LogoStrip";
import GatheringShowcase from "../../layout/GatheringShowcase";
import ApproHero from "../../layout/ApproHero";
import ApproMapNew from "../../layout/ApproMapNew";
import PhotoHero from "../../layout/PhotoHero";
import PhotoBlobs from "../../layout/PhotoBlobs";
import CheckpointStory from "../../layout/CheckpointStory";
import PartyScene from "../../layout/PartyScene";
import BlobPanel from "../../layout/BlobPanel";
import Testimonials from "../../layout/Testimonials";
import Faq from "../../layout/Faq";
import { useContent } from "../../i18n";
import { visible } from "../../content/content";
import LinkLabel from "../../layout/LinkLabel";

// Home, top to bottom: the promise with the app store buttons beside the
// app's screenshots sliding past → the visitor's own Appro on its map, its title over it → what you get when you host an Appro
// (a row of cards) → the promise (light the Bonfiire of connection) with the app
// store buttons → or keep it in one place (the single-location event) →
// planning a party in one place? (the organizing guide) → photos from events
// in blob shapes →
// who trusts us → what people say → questions.
// The cream (warm) background throughout, the odd section on the light one.
// Section titles line up on the left, like the hero (the Appro map's is centred).
// Sections sit still (no scroll animation); small drawings drift beside them
// (`doodles`).
// Text lives in src/content/<language>/home.json (the Appro events in appro.json) and
// the list files next to them.
// The Appro map near the top: the new one being worked on (ApproMapNew), or
// the one before it (ApproHero, kept as it is). false brings the old one back.
const NEW_APPRO_MAP = false;
// Whether that map is shown at all: hidden for now (2026-10-14), its title
// ("Hosting an Appro has never been easier") heading the Appro flow below
// instead (CheckpointStory). true brings the map back.
const SHOW_APPRO_MAP = false;

const HomePage = () => {
  const {
    contact,
    hostGathering,
    onePlace,
    photoHero,
    eventPhotos,
    popular,
    checkpoint,
  } = useContent("home");
  const partners = useContent("partners");
  const testimonials = useContent("testimonials");
  const faq = useContent("faq");

  const partnerItems = visible(partners.items);
  const testimonialItems = visible(testimonials.items);
  const faqItems = visible(faq.items);

  return (
    <div className="sections--light-first">
      {/* The very top: the promise (light the Bonfiire of connection, the
          page's h1), a line and the app store buttons, beside the app's
          screenshots sliding past in a row. */}
      <PhotoHero
        layout={photoHero.layout}
        title={photoHero.title}
        text={photoHero.text}
        screens={photoHero.screens}
        screensLabel={photoHero.screensLabel}
      />

      {/* Then: the title and a few lines, the visitor's own Appro on its map
          (signs dropping in). On a cream band, like the navbar above it. */}
      {SHOW_APPRO_MAP && NEW_APPRO_MAP && (
        <ApproMapNew
          title={popular.title}
          text={popular.text}
          next={{
            ...popular.next,
            labels: {
              ...popular.next.labels,
              swipe: onePlace.map.labels.swipe,
            },
          }}
          titleAs="h2"
        />
      )}
      {SHOW_APPRO_MAP && !NEW_APPRO_MAP && (
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
          titleAs="h2"
        />
      )}

      {/* Hosting an Appro, step by step (CheckpointStory): managing the
          checkpoints on the map, inviting participants, their map, check-in,
          scoring and the rest, each in a row of its own with its picture */}
      <Section className="section--services">
        <CheckpointStory
          title={checkpoint.title}
          text={checkpoint.text}
          steps={checkpoint.steps}
          label={checkpoint.stepsLabel}
        />
      </Section>

      {/* Need a demo or help? After what organizers get, a bold band in the
          brand orange: the question and a line on the left, the button to email
          us and the link to the help center on the right (stacked on phones). */}
      <Section className="section--compact section--get-app">
        <div className="contact-band">
          <Intro layout="left" title={contact.title} text={[contact.text]} />
          <div className="contact-band-actions">
            <a className="contact-band-button" href={`mailto:${contact.email}`}>
              {contact.button}
            </a>
            <Link className="contact-band-link" to={contact.help.to}>
              <LinkLabel text={contact.help.label} />
            </Link>
          </div>
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

      {/* Real photos from events, in breathing blob shapes taking turns in the
          middle, after the party panel */}
      <Section className="section--compact section--event-photos">
        <PhotoBlobs
          photos={eventPhotos.photos}
          label={eventPhotos.photosLabel}
        />
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
