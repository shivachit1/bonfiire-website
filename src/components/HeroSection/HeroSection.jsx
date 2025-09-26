import React from "react";
import { FaDownload } from "react-icons/fa";
import HeroHeader from "./HeroHeader.jsx"; // Import the new component
// import GatheringImage from '...'; // Assuming this path is correct
import "./HeroSection.css"; // Dedicated CSS for the layout
import { Button } from "../Button/Button.js";
import { Link } from "react-router-dom";

export const DownloadButton = (
  <Link className="link" to="/download">
    <Button text="Get the app">
      <FaDownload
        style={{
          backgroundColor: "transparent",
          color: "white",
          fontSize: "0.7rem",
        }}
      />
    </Button>
  </Link>
);

const HomeSection = ({ imageUrl }) => {
  return (
    <section className="homeSection">
      <div className="headerInfo">
        <HeroHeader
          infoText="Connecting Communities"
          title="Light the <br /> {Bonfiire} <br /> of Connection"
          subtitle="Discover local events, create meaningful connections, and build your community."
          button={DownloadButton}
        />

        {imageUrl && (
          <img className="svg-icon" src={imageUrl} alt="hero_image" />
        )}
      </div>
    </section>
  );
};

export default HomeSection;
