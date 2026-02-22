import React from "react";
import "./HeroHeader.css";
import HighLightText from "../HighLight/HighLightText";

const HeroHeader = ({ infoText, title, subtitle, className = "" }) => {
  const parts = title.match(/(.*?)(\{.*?\})(.*)/);

  const renderTextWithBreaks = (text) => {
    return text.split("<br />").map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  let titleContent;
  if (parts) {
    const [_, beforeText, highlightText, afterText] = parts;
    const cleanHighlight = highlightText.replace(/\{|\}/g, "").trim();

    titleContent = (
      <>
        {renderTextWithBreaks(beforeText)}
        <strong className="hight_light">{cleanHighlight}</strong>
        {renderTextWithBreaks(afterText)}
      </>
    );
  } else {
    titleContent = renderTextWithBreaks(title);
  }

  return (
    <div className={`hero-header ${className}`}>
      <div className="hero-badge-wrapper">
        <HighLightText text={infoText} />
      </div>
      <h1 className="hero-header-title">{titleContent}</h1>
      <div className="hero-header-subtitle-wrapper">
        <p>{subtitle}</p>
      </div>
    </div>
  );
};

export default HeroHeader;
