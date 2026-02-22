import "./index.css";

export const Button = ({ text, infoText, onPress, children }) => {
  return (
    <div className="button" onClick={onPress}>
      {children}
      <div>
        {infoText && <p>{infoText}</p>}
        <p className="text">{text}</p>
      </div>
    </div>
  );
};
