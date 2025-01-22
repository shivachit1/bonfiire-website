import React from "react";
import "./index.css";
import AppLinks from "../AppLinks/AppLinks";

export const CompanyInfo = () => {
  return (
    <div className="heroSection">
      <div className="heroSection_content">
        <h1>Social network for events</h1>
        <p>
          Whether you're managing a festival, conference, or private gathering,
          our platform is designed to make event organization smooth and
          efficient. With real-time updates, streamlined ticketing, and
          user-friendly tools, organizing events has never been easier. Join us
          and take your events to the next level!
        </p>
      </div>

      <AppLinks />
    </div>
  );
};
