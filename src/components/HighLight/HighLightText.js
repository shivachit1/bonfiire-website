// HeroHeader.jsx
import "./index.css"; // Dedicated CSS for this large heading

const HighLightText = ({ text }) => {
  return (
    <div className="highlight">
      <span className="highlighted_text">{text}</span>
    </div>
  );
};

export default HighLightText;
