import React from "react";
import "./index.css"; // Don't forget to create this CSS file

// Import icons (you'll need to define these or get them from a library like react-icons)
// For this example, I'll assume you have SVG or image paths, or can use an icon library
import {
  FaRocket,
  FaBullseye,
  FaBolt,
  FaCheckCircle,
  FaShieldAlt,
  FaWifi,
} from "react-icons/fa";
import SectionHeader from "../Header/Header";
// (If using react-icons, install: npm install react-icons)

const WhyJoinSection = () => {
  const featureCards = [
    {
      icon: <FaRocket />, // Rocket icon
      title: "Be a Pioneer",
      description:
        "Be among the first to shape how Gen-Z connects. Your early participation helps build the community.",
      iconBgGradient:
        "linear-gradient(to bottom right, #e56822, #FF7B42, #FFA05A)", // Orange gradient
    },
    {
      icon: <FaBullseye />, // Target icon
      title: "Perfect Timing",
      description:
        "Join before everyone else discovers it. Get exclusive access to early features and events.",
      iconBgGradient:
        "linear-gradient(to bottom right, #e56822,#FF7B42, #FFA05A)", // Orange gradient
    },
    {
      icon: <FaBolt />, // Bolt icon
      title: "Instant Impact",
      description:
        "Start creating and joining events immediately. No waiting, no complications – just real connections.",
      iconBgGradient:
        "linear-gradient(to bottom right, #e56822,#FF7B42, #FFA05A)", // Orange gradient
    },
  ];

  const benefitTags = [
    {
      icon: <FaCheckCircle style={{ color: "#4CAF50" }} />, // Green check
      text: "Verified Profiles",
    },
    {
      icon: <FaShieldAlt style={{ color: "#4285F4" }} />, // Blue shield
      text: "Safe & Secure",
    },
    {
      icon: <FaWifi style={{ color: "#FF7B42" }} />, // Orange Wi-Fi/connection
      text: "Instant Connections",
    },
  ];

  return (
    <section className="why-join-section">
      <SectionHeader
        title="Ready to Ignite Your {Social Life}?"
        subtitle="Join the movement and be among the first to experience authentic connections in your area."
      />

      <div className="feature-cards-container">
        {featureCards.map((card, index) => (
          <div key={index} className="feature-card">
            <div
              className="feature-icon-circle"
              style={{ background: card.iconBgGradient }} // Apply gradient directly or via CSS classes
            >
              {card.icon}
            </div>
            <h3 className="feature-title">{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>

      <div className="benefit-tags-container">
        {benefitTags.map((tag, index) => (
          <div key={index} className="benefit-tag">
            {tag.icon}
            <span className="benefit-text">{tag.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyJoinSection;
