import React from "react";
import { IoLogoAndroid } from "react-icons/io";
import { FaAppStoreIos } from "react-icons/fa";
import "./index.css"; // Optional CSS for styling

const linkData = [
  {
    icon: <IoLogoAndroid className="icon" />,
    title: "Android",
    link: "Android app",
  },
  {
    icon: <FaAppStoreIos className="icon" />,
    title: "iOS",
    link: "iOS App",
  },
];

const AppLinks = () => {
  return (
    <div id="services" className="appLinks">
      <h2>Download App</h2>
      <p>Our app are available for Android and iOS mobile devices.</p>
      <div className="appLinks-list">
        {linkData.map((link, index) => (
          <div className="appLinks-card" key={index}>
            {link.icon}
            <h4>{link.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppLinks;
