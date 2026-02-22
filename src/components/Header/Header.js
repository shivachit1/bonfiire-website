import "./index.css";

const SectionHeader = ({ title, subtitle, className = "" }) => {
  // Regex to find the {highlighted text}
  const parts = title.match(/(.*?)(\{.*?\})(.*)/);

  let titleContent;

  if (parts) {
    const [, beforeText, highlightText, afterText] = parts;
    const cleanHighlight = highlightText.replace(/\{|\}/g, "");

    titleContent = (
      <>
        {beforeText}
        <span className="highlight-text">{cleanHighlight}</span>
        {afterText}
      </>
    );
  } else {
    titleContent = title;
  }

  return (
    <div className={`section-header-container ${className}`}>
      <h2 className="section-header-title">{titleContent}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;
