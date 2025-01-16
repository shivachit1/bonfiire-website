import React from "react";
import "./index.css";
import { ReactComponent as SvgImage } from "./svgImage.svg"; // Adjust the path to your SVG
import { Link } from "react-scroll";

export const CompanyInfo = () => {
  return (
    <div className="heroSection">
      <div className="heroSection_content">
        <h1>Effortless Event Planning, Seamless Management</h1>
        <p>
          Whether you're managing a festival, conference, or private gathering,
          our platform is designed to make event organization smooth and
          efficient. With real-time updates, streamlined ticketing, and
          user-friendly tools, organizing events has never been easier. Join us
          and take your events to the next level!
        </p>
      </div>

      <SvgImage className="hero-icon" />
    </div>
  );
};
