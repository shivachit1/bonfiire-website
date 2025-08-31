import "./index.css";
import { LuUsers, LuCalendarDays, LuLocateFixed, LuBell } from "react-icons/lu";

export const servicesData = [
  {
    title: "Connect with Your Community",
    icon: <LuUsers className="icon" />,
    description:
      "Find people who share your interests and passions. Build meaningful connections that last beyond the screen.",
  },
  {
    title: "Discover Local Events",
    icon: <LuCalendarDays className="icon" />,
    description:
      "Browse through a curated list of events happening near you. From casual meetups to organized activities.",
  },
  {
    title: "Location-Based Matching",
    icon: <LuLocateFixed className="icon" />,
    description:
      "Find people who share your interests and passions. Build meaningful connections that last beyond the screen.",
  },
  {
    title: "Real-time Notifications",
    icon: <LuBell className="icon" />,
    description:
      "Never miss an opportunity to connect. Get notified about new events, messages, and connection requests.",
  },
];
