import { LuUsers, LuCalendarCheck2, LuLocateFixed } from "react-icons/lu";
import { PiShootingStarFill } from "react-icons/pi";

export const servicesData = [
  {
    title: "Discover Events",
    icon: <LuLocateFixed className="icon" />,
    description:
      "Find exciting local activities and events happening around you. From coffee meetups to adventure sports.", // 17 words
  },
  {
    title: "Connect with People",
    icon: <LuUsers className="icon" />,
    description:
      "Meet like-minded individuals who share your interests. Build genuine friendships that last.", // 18 words
  },
  {
    title: "Create Your Bonfiire",
    icon: <LuCalendarCheck2 className="icon" />,
    description:
      "Host your own events and bring your community together. Be the spark that ignites connections..", // 18 words
  },
  {
    title: "Build Community",
    icon: <PiShootingStarFill className="icon" />,
    description:
      "Join interest-based groups and create lasting bonds with people who get you.", // 18 words
  },
];
