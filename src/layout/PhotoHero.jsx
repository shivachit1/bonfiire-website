import "./layout.css";
import Intro from "./Intro";
import AppLinks from "../components/AppLinks/AppLinks";
import PhotoMosaic from "./PhotoMosaic";
import PhotoStack from "./PhotoStack";
import PhotoBlobs from "./PhotoBlobs";

// The very top of the home page, on the cream: the promise (the page's h1)
// with a line under it and the app store buttons on the left; on the right,
// real photos from Bonfiire events (stacked under the words on phones, the
// words centred), shown one of two ways:
//   layout        "stack" (a deck of cards, the top one swiped away every few
//                 seconds, PhotoStack.jsx), "mosaic" (five tiles swapping
//                 photos, PhotoMosaic.jsx) or "blobs" (photos in breathing
//                 blob shapes, PhotoBlobs.jsx)
//   title, text   the heading ({braces} in the accent colour, \n breaks a line)
//                 and the line under it
//   photos        [{ image, alt }]: names from src/assets/photos
//   photosLabel   what the photos are, for screen readers
const LAYOUTS = { stack: PhotoStack, mosaic: PhotoMosaic, blobs: PhotoBlobs };

const PhotoHero = ({ layout = "stack", title, text, photos, photosLabel }) => {
  const Photos = LAYOUTS[layout] || PhotoStack;
  return (
    <section className="section section--cream photo-hero">
      <div className="container container--wide photo-hero-inner">
        <Intro as="h1" size="page" layout="left" title={title} text={[text]}>
          <AppLinks />
        </Intro>
        <Photos photos={photos} label={photosLabel} />
      </div>
    </section>
  );
};

export default PhotoHero;
