import "./index.css";
import {
  FaRocket,
  FaBullseye,
  FaBolt,
  FaCheckCircle,
  FaShieldAlt,
  FaWifi,
} from "react-icons/fa";
import SectionHeader from "../Header/Header";

const WhyJoinSection = () => {
  const featureCards = [
    {
      icon: <FaRocket />,
      title: "Be a Pioneer",
      description:
        "Be among the first to shape how Gen-Z connects. Your early participation helps build the community.",
    },
    {
      icon: <FaBullseye />,
      title: "Perfect Timing",
      description:
        "Join before everyone else discovers it. Get exclusive access to early features and events.",
    },
    {
      icon: <FaBolt />,
      title: "Instant Impact",
      description:
        "Start creating and joining events immediately. No waiting, no complications – just real connections.",
    },
  ];

  const benefitChips = [
    {
      icon: <FaCheckCircle className="chip-icon-green" />,
      text: "Verified Profiles",
    },
    { icon: <FaShieldAlt className="chip-icon-blue" />, text: "Safe & Secure" },
    {
      icon: <FaWifi className="chip-icon-orange" />,
      text: "Instant Connections",
    },
  ];

  return (
    <section className="why-join-section">
      <SectionHeader
        title="Ready to Ignite Your {Social Life}?"
        subtitle="Join the movement and be among the first to experience authentic connections in your area."
      />

      <div className="why-join-container">
        {featureCards.map((card, index) => (
          <div key={index} className="why-join-card">
            <div className="why-join-icon-circle">{card.icon}</div>
            <h3 className="why-join-title">{card.title}</h3>
            <p className="why-join-description">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="chips-wrapper">
        {benefitChips.map((chip, index) => (
          <div key={index} className="benefit-chip">
            {chip.icon}
            <span className="chip-text">{chip.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyJoinSection;
