// HeroHeader.jsx
import React from "react";
import "./HeroHeader.css"; // Dedicated CSS for this large heading
import HighLightText from "../HighLight/HighLightText";

const HeroHeader = ({ infoText, title, subtitle, button, className = "" }) => {
  // Logic to handle the highlight part (e.g., 'Light the <br /> {Bonfiire}')
  const parts = title.match(/(.*?)(\{.*?\})(.*)/);
  let titleContent;

  if (parts) {
    const [beforeText, highlightText, afterText] = parts;
    const cleanHighlight = highlightText.replace(/\{|\}/g, " "); // Use space instead of strong for clean output

    titleContent = (
      <>
        {beforeText.split("<br />").map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < beforeText.split("<br />").length - 1 && <br />}
          </React.Fragment>
        ))}
        <strong className="hight_light">{cleanHighlight}</strong>
        {afterText.split("<br />").map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < afterText.split("<br />").length - 1 && <br />}
          </React.Fragment>
        ))}
      </>
    );
  } else {
    // Render the title as plain text, respecting <br /> tags
    titleContent = title.split("<br />").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < title.split("<br />").length - 1 && <br />}
      </React.Fragment>
    ));
  }

  return (
    <div className={`hero-header ${className}`}>
      <HighLightText text={infoText} />
      <h1 className="hero-header-title">{titleContent}</h1>
      <div className="hero-header-subtitle-wrapper">
        <p className="hero-header-subtitle">{subtitle}</p>
      </div>
      {button && <div className="storeDiv">{button}</div>}
    </div>
  );
};

export default HeroHeader;
