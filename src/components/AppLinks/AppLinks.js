import React from "react";
import "./index.css"; // Optional CSS for styling
import { Link } from "react-router-dom";
import { androidData, iosData } from "../../downloadData";

const AppLinks = () => {
  return (
    <div id="services" className="appLinks">
      <div className="appLinks-list">
        <Link className="appLinks-card" to={androidData.downloadLink}>
          {androidData.icon}
          <h4>{androidData.title}</h4>
        </Link>
        <Link className="appLinks-card" to="/download">
          {iosData.icon}
          <h4>{iosData.title}</h4>
        </Link>
      </div>
    </div>
  );
};

export default AppLinks;
