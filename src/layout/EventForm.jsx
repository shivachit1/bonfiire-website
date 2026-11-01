import { FiCheck, FiChevronLeft } from "react-icons/fi";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./layout.css";

// The app's "Create New Event" screen, after its screenshot (drawn in the
// app's em sizes, so it looks the same in a phone, PhoneFrame, or on a
// panel of its own): its top bar, "Event Information" with the name and the
// description in outlined boxes (their labels set into the outline, the
// hint in grey till filled, the description's counter in its corner),
// "Event Time" with the start and the end (a green and a red edge), "Event
// Location" with the "Multiple Locations" box and the "Select location from
// Map" button. Filled in as `step` goes on, the box being filled outlined
// in orange; the form scrolls down to the time at `at.scroll`.
//   card  { heading, info, name: { label, placeholder, value },
//         description: { label, placeholder, value, max }, when: { title,
//         text }, start: { label, value }, end: { label, value }, location:
//         { title, text }, multiple: { label, text }, pick }
//   step  how far it's filled in
//   at    the step each part comes at: { name, description, scroll, start,
//         end, multiple } (multiple: the "Multiple Locations" box ticked, as
//         for an Appro; left out: never ticked)
const EventForm = ({ card, step, at }) => {
  const filled = (n) => (n && step >= n ? " is-filled" : "");
  const current = (n) => (step === n ? " is-current" : "");
  const { name, description, start, end } = card;
  const box = (n, field, extra = "") => (
    <span className={`fx-form-box${extra}${filled(n)}${current(n)}`}>
      <span className="fx-form-legend">{field.label}</span>
      <span className="fx-form-hint">{field.placeholder}</span>
      <span className="fx-form-value">{field.value}</span>
      {field.max && (
        <span className="fx-form-count">
          {step >= n ? field.value.length : 0}/{field.max}
        </span>
      )}
    </span>
  );
  const time = (n, field, extra) => (
    <span className={`fx-form-time ${extra}${filled(n)}${current(n)}`}>
      <span className="fx-form-time-label">{field.label}</span>
      <span className="fx-form-value">{field.value}</span>
    </span>
  );
  const ticked = at.multiple && step >= at.multiple;
  return (
    <div className={`fx-form${step >= at.scroll ? " is-at-time" : ""}`}>
      <span className="fx-app-bar fx-form-bar">
        <FiChevronLeft />
        <b>{card.heading}</b>
        <span />
      </span>
      <b className="fx-form-section">{card.info}</b>
      {box(at.name, name)}
      {box(at.description, description, " is-tall")}
      <span className="fx-form-section">
        <b>{card.when.title}</b>
        <span>{card.when.text}</span>
      </span>
      {time(at.start, start, "is-start")}
      {time(at.end, end, "is-end")}
      <span className="fx-form-section">
        <b>{card.location.title}</b>
        <span>{card.location.text}</span>
      </span>
      <span
        className={`fx-form-check${ticked ? " is-ticked" : ""}${current(at.multiple)}`}
      >
        <i>
          <FiCheck />
        </i>
        <span>
          <b>{card.multiple.label}</b>
          <span>{card.multiple.text}</span>
        </span>
      </span>
      <span className="fx-form-pick">
        <FaMapMarkerAlt />
        {card.pick}
      </span>
    </div>
  );
};

export default EventForm;
