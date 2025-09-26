import "./index.css";
import { LuUsers, LuCalendarDays, LuLocateFixed, LuBell } from "react-icons/lu";

export const servicesData = [
  {
    title: "Discover Events",
    icon: <LuUsers className="icon" />,
    description:
      "Find exciting local activities and events happening around you. From coffee meetups to adventure sports.",
  },
  {
    title: "Connect with People",
    icon: <LuCalendarDays className="icon" />,
    description:
      "Meet like-minded individuals who share your interests. Build genuine friendships that last.",
  },
  {
    title: "Create Your Bonfiire",
    icon: <LuLocateFixed className="icon" />,
    description:
      "Host your own events and bring your community together. Be the spark that ignites connections.",
  },
  {
    title: "Build Community",
    icon: <LuBell className="icon" />,
    description:
      "Join interest-based groups and create lasting bonds with people who get you.",
  },
];
