import HeroHeader from "./HeroHeader.jsx"; // Import the new component
// import GatheringImage from '...'; // Assuming this path is correct
import "./HeroSection.css";
import AppLinks from "../AppLinks/AppLinks.js";


const HomeSection = ({ imageUrl }) => {
  return (
    <section className="homeSection">
      <div className="headerInfo">
        <div>
          <HeroHeader
            infoText="Connecting Communities"
            title="Light the <br /> {Bonfiire} <br /> of Connection"
            subtitle="Discover local events, create meaningful connections, and build your community."
          />
          <AppLinks />
        </div>
        {imageUrl && (
          <img className="svg-icon" src={imageUrl} alt="hero_image" />
        )}
      </div>
    </section>
  );
};

export default HomeSection;
