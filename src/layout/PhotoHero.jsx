import "./layout.css";
import Intro from "./Intro";
import AppLinks from "../components/AppLinks/AppLinks";
import PhotoMosaic from "./PhotoMosaic";
import PhotoStack from "./PhotoStack";
import PhotoBlobs from "./PhotoBlobs";
import AppScreens from "./AppScreens";

// The very top of the home page, on the cream: the promise (the page's h1)
// with a line under it and the app store buttons on the left; on the right,
// screenshots of the app or real photos from Bonfiire events (stacked under
// the words on phones, the words centred), shown one of these ways:
//   layout        "screens" (the app's screenshots sliding past in a row,
//                 AppScreens.jsx, from `screens`), "stack" (a deck of cards,
//                 the top one swiped away every few seconds, PhotoStack.jsx),
//                 "mosaic" (five tiles swapping photos, PhotoMosaic.jsx) or
//                 "blobs" (photos in breathing blob shapes, PhotoBlobs.jsx)
//   title, text   the heading ({braces} in the accent colour, \n breaks a line)
//                 and the line under it
//   photos        [{ image, alt }]: names from src/assets/photos
//   photosLabel   what the photos are, for screen readers
//   screens, screensLabel   the same for the app's screenshots ("screens")
const LAYOUTS = { stack: PhotoStack, mosaic: PhotoMosaic, blobs: PhotoBlobs };

const PhotoHero = ({
  layout = "stack",
  title,
  text,
  photos,
  photosLabel,
  screens,
  screensLabel,
}) => {
  const Photos = LAYOUTS[layout] || PhotoStack;
  return (
    <section className="section section--cream photo-hero">
      <div className="container container--wide photo-hero-inner">
        <Intro as="h1" size="page" layout="left" title={title} text={[text]}>
          <AppLinks />
        </Intro>
        {layout === "screens" ? (
          <AppScreens screens={screens} label={screensLabel} />
        ) : (
          <Photos photos={photos} label={photosLabel} />
        )}
      </div>
    </section>
  );
};

export default PhotoHero;
