import { Link } from "react-router-dom";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import "./layout.css";
import Heading from "./Heading";

// A help topic as a card that opens its page: title and a line about it, with
// a nudging orange chevron. `back` points it left (e.g. "Previous").
// `label` is an optional small line above the title (e.g. "Next").
const HelpCard = ({ to, title, text, label, back }) => {
  return (
    <Link className="help-card" to={to}>
      <span className="help-card-body">
        {label && <span className="help-card-label">{label}</span>}
        <Heading size="item" as="span" className="help-card-title">
          {title}
        </Heading>
        {text && <span className="help-card-text">{text}</span>}
      </span>
      <span className="help-card-arrow" aria-hidden="true">
        {back ? <LuChevronLeft /> : <LuChevronRight />}
      </span>
    </Link>
  );
};

export default HelpCard;
