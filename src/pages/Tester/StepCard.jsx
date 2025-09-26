// StepCard.jsx
import "./index.css";

const StepCard = ({ item }) => {
  return (
    <div className="steps-card">
      <div className="steps-header-title">{item.headerTitle}</div>
      <img className="steps-image" src={item.icon} alt={item.title} />
      <h3 className="steps-title">{item.title}</h3>
      <p className="steps-description">{item.description}</p>
      {item.buttonText && (
        <a href={item.url} className="steps-button">
          {item.buttonText}
        </a>
      )}
    </div>
  );
};

export default StepCard;
