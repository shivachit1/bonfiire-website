import React from "react";
import "./index.css"; // Create this CSS file for styling

/**
 * Reusable component for section titles and subtitles.
 * It automatically handles the highlight formatting in the title.
 * * @param {object} props
 * @param {string} props.title - The main heading text, use '{highlight}'
 * to mark the section to be highlighted (e.g., "Ready to Ignite Your {Social Life}?")
 * @param {string} props.subtitle - The supporting paragraph text.
 * @param {string} [props.className] - Optional CSS class for the container.
 */
const SectionHeader = ({ title, subtitle, className = "" }) => {
  // 1. Split the title based on the highlight marker (e.g., '{Social Life}')
  // This allows the component to receive the full title and automatically apply the styling.
  const parts = title.match(/(.*?)(\{.*?\})(.*)/);

  // Default to treating the whole title as standard text if no highlight marker is found
  let titleContent;

  if (parts) {
    const [_, beforeText, highlightText, afterText] = parts;
    const cleanHighlight = highlightText.replace(/\{|\}/g, ""); // Remove the braces

    titleContent = (
      <>
        {beforeText}
        <span className="highlight-text">{cleanHighlight}</span>
        {afterText}
      </>
    );
  } else {
    // If no curly braces are found, render the title as plain text
    titleContent = title;
  }

  return (
    <div className={`section-header ${className}`}>
      <h2 className="section-header-title">{titleContent}</h2>
      <p className="section-header-subtitle">{subtitle}</p>
    </div>
  );
};

export default SectionHeader;
