// Photos that content files can refer to by name, e.g. "image": "tug-of-war".
// To add one: drop the file in this folder and add a line below.
import gathering from "./gathering.webp";
import qrTicket from "./qr-ticket.jpeg";
import tugOfWar from "./tug-of-war.jpeg";
import groupMeetup from "./group-meetup.jpeg";
import friendsPhones from "./friends-phones.jpeg";
import nightGroup from "./night-group.jpeg";
import plainMap from "./plain_map.jpg";
// Central Helsinki in the owner's map style (from OpenStreetMap data, made
// with MapLibre; 3600 × 1800), under the home page's Appro map.
import approMap from "./appro-map.jpg";
// The same twice as wide and high round it (3600 × 1800), to zoom in from.
import approMapWide from "./appro-map-wide.jpg";
// Small square face crops (from the portrait-*.png photos) for round avatars.
import avatarBeanie from "./avatars/beanie.jpg";
import avatarCurlyHair from "./avatars/curly-hair.jpg";
import avatarShortDarkHair from "./avatars/short-dark-hair.jpg";
import avatarTurtleneck from "./avatars/turtleneck.jpg";
import avatarBraids from "./avatars/braids.jpg";
import avatarDenimJacket from "./avatars/denim-jacket.jpg";
import avatarBookshelf from "./avatars/bookshelf.jpg";
import avatarBobHaircut from "./avatars/bob-haircut.jpg";
import avatarLongBlondeHair from "./avatars/long-blonde-hair.jpg";
import avatarGreenSweater from "./avatars/green-sweater.jpg";
import avatarRedHair from "./avatars/red-hair.jpg";
// Screenshots of the app in a phone (from the screen-*-portrait.png files,
// 560 wide), for the home hero.
import screenExplore from "./app-screens/explore.webp";
import screenEventParticipating from "./app-screens/event-participating.webp";
import screenETicket from "./app-screens/e-ticket.webp";
import screenCheckpoints from "./app-screens/checkpoints.webp";

const photos = {
  gathering,
  "qr-ticket": qrTicket,
  "tug-of-war": tugOfWar,
  "group-meetup": groupMeetup,
  "friends-phones": friendsPhones,
  "night-group": nightGroup,
  "plain-map": plainMap,
  "appro-map": approMap,
  "appro-map-wide": approMapWide,
  "screen-explore": screenExplore,
  "screen-event-participating": screenEventParticipating,
  "screen-e-ticket": screenETicket,
  "screen-checkpoints": screenCheckpoints,
  "avatar-beanie": avatarBeanie,
  "avatar-curly-hair": avatarCurlyHair,
  "avatar-short-dark-hair": avatarShortDarkHair,
  "avatar-turtleneck": avatarTurtleneck,
  "avatar-braids": avatarBraids,
  "avatar-denim-jacket": avatarDenimJacket,
  "avatar-bookshelf": avatarBookshelf,
  "avatar-bob-haircut": avatarBobHaircut,
  "avatar-long-blonde-hair": avatarLongBlondeHair,
  "avatar-green-sweater": avatarGreenSweater,
  "avatar-red-hair": avatarRedHair,
};

export default photos;
