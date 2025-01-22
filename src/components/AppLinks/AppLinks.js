import React from "react";
/* import { IoLogoAndroid } from "react-icons/io";
import { FaAppStoreIos } from "react-icons/fa"; */
import "./index.css"; // Optional CSS for styling

/* const linkData = [
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
]; */

const AppLinks = () => {
  return (
    <div id="services" className="appLinks">
      <h1 style={{ color: "#27AE60" }}>Stay tuned.....</h1>
      <p>
        Our app will soon be available for download on both Android and iOS
        devices. Keep checking back for the latest updates and links!
      </p>
      {/*       <div className="appLinks-list">
        {linkData.map((link, index) => (
          <div className="appLinks-card" key={index}>
            {link.icon}
            <h4>{link.title}</h4>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default AppLinks;
