import React from "react";
import { MdEventAvailable } from "react-icons/md";
import { TiMessages } from "react-icons/ti";
import { FaMapLocationDot } from "react-icons/fa6";
import { FaRegBell } from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import "./index.css"; // Optional CSS for styling

const servicesData = [
  {
    icon: <MdEventAvailable className="icon" />,
    title: "Event Management",
    description:
      "Targeting seamless event management platform provided as per your need.",
  },
  {
    icon: <FaMapLocationDot className="icon" />,
    title: "Map integration",
    description:
      "With google maps integration in app, events are targeted to specific users within the location",
  },
  {
    icon: <TiMessages className="icon" />,
    title: "Message Integration",
    description: "We provide chat forum for events to stay up to date.",
  },

  {
    icon: <FaRegBell className="icon" />,
    title: "Notification",
    description:
      "We provide top notch notification tailored for specific users engagements",
  },
  {
    icon: <HiOutlineLocationMarker className="icon" />,
    title: "Location sharing",
    description: "Sharing live location with friends, and followers",
  },
  {
    icon: <HiOutlineLocationMarker className="icon" />,
    title: "Realtime integration",
    description: "We provide seamless realtime updates",
  },
];

const MyServices = () => {
  return (
    <div id="services" className="services">
      <h2>Our Services</h2>
      <p>
        We provide a full range of accounting services tailored to meet your
        needs.
      </p>
      <div className="services-list">
        {servicesData.map((service, index) => (
          <div className="service-card" key={index}>
            {service.icon}
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyServices;
