import Section from "../../layout/Section";
import HostCta from "../../layout/HostCta";
import Intro from "../../layout/Intro";
import LogoStrip from "../../layout/LogoStrip";
import ApproHero from "../../layout/ApproHero";
import ApproMapNew from "../../layout/ApproMapNew";
import PhotoHero from "../../layout/PhotoHero";
import { MoreRow } from "../../layout/CheckpointStory";
import Testimonials from "../../layout/Testimonials";
import AppLinks from "../../components/AppLinks/AppLinks";
import { useContent } from "../../i18n";
import { visible } from "../../content/content";
import PhotoPile from "../../layout/PhotoPile";
import PlanFlow from "../../layout/PlanFlow";
import HowSteps from "../../layout/HowSteps";

// Home, top to bottom: the promise with the app store buttons and the social
// accounts beside the app's screenshots sliding past → build endless memories
// with friends (photos from student events as overlapping prints, a light
// band) → plan your next gathering ("Host an event" with the kinds of events
// round it as chips; the steps story, PlanGathering, before it; How it works, the steps in a row sliding along, was after it
// and removed 2026-10-28; What you can do in Bonfiire, the phones' scroll
// story, AppHighlights, was next, removed 2026-10-28 and kept for later)
// → hosting an Appro (the
// complete Appro map, and under it in the same band more for your Appro, a
// row you scroll sideways) → need a demo or help?
// → what people say and who trusts us (one band) → the app store buttons.
// The cream (warm) background throughout, the odd section on the light one.
// Section titles line up on the left, like the hero (the Appro map's is centred).
// Sections sit still (no scroll animation); small drawings drift beside them
// (`doodles`).
// Text lives in src/content/<language>/home.json (the Appro events in appro.json) and
// the list files next to them.
// The Appro map near the top: the new one being worked on (ApproMapNew), or
// the one before it (ApproHero, kept as it is). false brings the old one back.
const NEW_APPRO_MAP = false;
// Whether that map is shown at all, here: hidden (2026-10-14). The complete
// map (ApproHero) is shown in the Hosting an Appro section above instead
// (2026-10-26), so true would show it twice.
const SHOW_APPRO_MAP = false;

const HomePage = () => {
  const {
    contact,
    hero,
    onePlace,
    photoHero,
    popular,
    checkpoint,
    memories,
    hostEvent,
    planBoard,
    howSteps,
    hostCta,
  } = useContent("home");
  const partners = useContent("partners");
  const testimonials = useContent("testimonials");

  const partnerItems = visible(partners.items);
  const testimonialItems = visible(testimonials.items);

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
        cta={photoHero.cta}
        socialLabel={photoHero.socialLabel}
        follow={photoHero.follow}
      />

      {/* Build endless memories with friends: its title, then photos from
          student events as prints in an overlapping row, dealt in as it
          scrolls into view (PhotoPile). A band of its own, right after the hero
          (2026-10-31, in place of the "Events are where friendships begin"
          title band, kept as WhoFor, unused); the bands take turns, cream and
          light. */}
      <PhotoPile
        title={memories.title}
        label={memories.photosLabel}
        photos={memories.photos}
      />

      {/* Plan your next gathering (PlanFlow): the arc of events with the title.
          (The card with invite friends and track RSVPs under it was removed
          2026-10-30, kept as InviteRsvpCards. PlanBoard, HostEvent and
          PlanGathering are kept for now.) */}
      <PlanFlow
        title={planBoard.title}
        arc={planBoard.arc}
        people={hostEvent.invite.people}
        text={hostCta.text}
        primary={hostCta.primary}
        demo={hostCta.demo}
        mailto={`mailto:${contact.email}?subject=${encodeURIComponent(
          contact.emailSubject,
        )}&body=${encodeURIComponent(contact.emailBody.join("\n"))}`}
      />

      {/* How it works: create an event, invite friends, track RSVPs, in a row
          you scroll sideways with dots under it (HowSteps). */}
      <HowSteps {...howSteps} />

      {/* (The "Are you hosting a gathering?" band with a photo was removed
          2026-10-30, kept as HostCta, unused. Its buttons and line are under
          "Host your next gathering" above.) */}

      {/* Hosting an Appro: its title, then the complete Appro map
          (ApproHero: the checkpoints dropping in, their hosts invited and
          accepting, groups walking the route, with its status line and guest
          list). (ApproFullMap, the map with you walking the route and
          checking in, was here before; kept for now.) */}
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
      >
        {/* In the same section, right under the map: more for your Appro
            (CheckpointStory's MoreRow): the participants' map, ticket sales,
            check-in with a QR code, scoring, photos and the history, in a
            row you scroll sideways. ("Are you hosting next Appro?"
            (HostKinds) and the steps of how it works (CheckpointStory) were
            after the map before; removed 2026-10-26.) */}
        <MoreRow {...checkpoint.more} />
      </ApproHero>

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

      {/* Need a demo or help? After what organizers get, with no panel behind
          it: the question and a line on the left, the button to request a demo
          (an email to us, its subject and an outline already filled in) under the
          line, and a real photo on the right (HostCta, as the gathering band had). */}
      <HostCta
        title={contact.title}
        text={contact.text}
        photos={contact.photos}
        primary={contact.primary}
        demo={contact.demo}
        mailto={`mailto:${contact.email}?subject=${encodeURIComponent(
          contact.emailSubject,
        )}&body=${encodeURIComponent(contact.emailBody.join("\n"))}`}
      />

      {/* Who trusts us and, in the same band under it, what people say */}
      {(testimonialItems.length > 0 || partnerItems.length > 0) && (
        <Section className="section--cream section--voices" doodles="stories">
          {partnerItems.length > 0 && (
            <LogoStrip
              title={partners.title}
              items={partnerItems}
              cta={{
                text: partners.cta.text,
                label: partners.cta.label,
                href: `mailto:${contact.email}?subject=${encodeURIComponent(
                  partners.cta.emailSubject,
                )}&body=${encodeURIComponent(partners.cta.emailBody.join("\n"))}`,
              }}
            />
          )}
          {testimonialItems.length > 0 && (
            <Intro title={testimonials.title} as="h3" size="item">
              <Testimonials items={testimonialItems} />
            </Intro>
          )}
        </Section>
      )}

      {/* Last: where to get the app (the hero's words, in place of the
          questions removed 2026-10-31, Faq kept) and the two store buttons beside them (under the words on phones). */}
      <Section className="section--cream">
        <div className="contact-band">
          <Intro layout="left" title={hero.title} text={[hero.text]} />
          <AppLinks />
        </div>
      </Section>
    </div>
  );
};

export default HomePage;
