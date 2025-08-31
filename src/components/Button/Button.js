import "./index.css";

export const Button = ({ text, onPress, children }) => {
  return (
    <div className="button" onClick={onPress}>
      {children}
      <p className="text">{text}</p>
    </div>
  );
};
