// Photos that content files can refer to by name, e.g. "image": "tug-of-war".
// To add one: drop the file in this folder and add a line below.
import gathering from "./gathering.webp";
import qrTicket from "./qr-ticket.jpeg";
import tugOfWar from "./tug-of-war.jpeg";
import groupMeetup from "./group-meetup.jpeg";
import friendsPhones from "./friends-phones.jpeg";
import nightGroup from "./night-group.jpeg";

const photos = {
  gathering,
  "qr-ticket": qrTicket,
  "tug-of-war": tugOfWar,
  "group-meetup": groupMeetup,
  "friends-phones": friendsPhones,
  "night-group": nightGroup,
};

export default photos;
