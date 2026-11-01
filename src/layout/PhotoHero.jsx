import "./layout.css";
import { Link } from "react-router-dom";
import Intro from "./Intro";
import LinkLabel from "./LinkLabel";
import AppLinks from "../components/AppLinks/AppLinks";
import PhotoMosaic from "./PhotoMosaic";
import PhotoStack from "./PhotoStack";
import PhotoBlobs from "./PhotoBlobs";
import AppScreens from "./AppScreens";
import HeroPhones from "./HeroPhones";
import HeroShapes from "./HeroShapes";
import SocialLinks from "./SocialLinks";

// The very top of the home page, on the cream: the promise (the page's h1)
// with a line under it and a button (`cta`) or the app store buttons on the left; on the right,
// screenshots of the app or real photos from Bonfiire events (stacked under
// the words on phones, the words centred), shown one of these ways:
//   layout        "stage" (the app's screenshots big in the middle among
//                 floating shapes, HeroShapes.jsx, and the big title over
//                 their bottom left, dropping in line by line; stacked on
//                 phones), "screens" (the app's screenshots beside the words,
//                 AppScreens.jsx, from `screens`), "blob" (the same, one up
//                 at a time rising out of a blob, the others tiny round it,
//                 HeroPhones.jsx), "stack" (a deck of cards,
//                 the top one swiped away every few seconds, PhotoStack.jsx),
//                 "mosaic" (five tiles swapping photos, PhotoMosaic.jsx) or
//                 "blobs" (photos in breathing blob shapes, PhotoBlobs.jsx)
//   title, text   the heading ({braces} in the accent colour, \n breaks a line)
//                 and the line under it
//   photos        [{ image, alt }]: names from src/assets/photos
//   photosLabel   what the photos are, for screen readers
//   screens, screensLabel   the same for the app's screenshots ("screens")
//   cta           { label, to } or a list of them: buttons under the words,
//                 in place of the app store buttons (left out: the app store
//                 buttons); the first in the orange, the others outlined; a
//                 "→" at the end of a label nudges forward (LinkLabel)
//   follow        the words before the social icons under the buttons
//                 ("Follow Bonfiire"; left out: the icons alone)
//   socialLabel   what the social icons are, for screen readers (the
//                 accounts themselves: ui.json)
const LAYOUTS = { stack: PhotoStack, mosaic: PhotoMosaic, blobs: PhotoBlobs };

const PhotoHero = ({
  layout = "stack",
  title,
  text,
  photos,
  photosLabel,
  screens,
  screensLabel,
  cta,
  socialLabel,
  follow,
}) => {
  const Photos = LAYOUTS[layout] || PhotoStack;
  // (`cta`: one button or a list of them; the first in the orange, the
  // others outlined)
  const ctas = cta ? [].concat(cta) : null;
  // "Follow Bonfiire" and the social accounts, on one line
  const followRow = (
    <div className="hero-follow">
      {follow && <span className="hero-follow-label">{follow}</span>}
      <SocialLinks
        listClass="hero-social"
        linkClass="hero-social-link"
        label={socialLabel}
      />
    </div>
  );
  const buttons = ctas ? (
    <p className="photo-hero-actions">
      {ctas.map(({ label, to }, i) => (
        <Link
          key={label}
          className={i === 0 ? "button-primary" : "button-secondary"}
          to={to}
        >
          <LinkLabel text={label} />
        </Link>
      ))}
    </p>
  ) : (
    <AppLinks />
  );
  const actions = (
    <>
      {buttons}
      {/* Under the buttons: "Follow Bonfiire" and the social accounts */}
      {followRow}
    </>
  );

  if (layout === "stage") {
    return (
      <section className="section section--cream photo-hero photo-hero--stage">
        <div className="container container--wide photo-hero-stage">
          <div className="photo-hero-picture">
            <HeroShapes place="back" />
            <AppScreens screens={screens} label={screensLabel} />
            <HeroShapes place="front" />
          </div>
          <Intro as="h1" size="page" layout="left" title={title} text={[text]}>
            {actions}
          </Intro>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--cream photo-hero">
      <div className="container container--wide photo-hero-inner">
        {/* The title, its line and the buttons in the middle of the row's
            height (beside the picture), "Follow Bonfiire" and the social
            accounts at its bottom left (stacked under the buttons on phones
            and tablets) */}
        <div className="photo-hero-words">
          <Intro as="h1" size="page" layout="left" title={title} text={[text]}>
            {buttons}
          </Intro>
          {followRow}
        </div>
        {layout === "blob" ? (
          <HeroPhones screens={screens} label={screensLabel} />
        ) : layout === "screens" ? (
          <AppScreens screens={screens} label={screensLabel} />
        ) : (
          <Photos photos={photos} label={photosLabel} />
        )}
      </div>
    </section>
  );
};

export default PhotoHero;
