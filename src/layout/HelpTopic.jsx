import { useEffect, useState } from "react";
import { LuCheck, LuLink } from "react-icons/lu";
import "./layout.css";
import icons from "./icons";
import HelpSteps from "./HelpSteps";

// One help topic as its own block: icon, title, a "Copy link" button, then the steps.
// topic: { id, icon, title, text?, steps }   `link` is the full address of this topic.
// labels: { copyLink, copied, step } from ui.json.
const HelpTopic = ({ topic, group, link, labels }) => {
  const [copied, setCopied] = useState(false);
  const Icon = icons[topic.icon];

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Older browsers: fall back to a hidden text field.
      const field = document.createElement("textarea");
      field.value = link;
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
  };

  return (
    <article id={topic.id} className="help-topic">
      <header className="help-topic-header">
        {Icon && (
          <span className="help-topic-icon" aria-hidden="true">
            <Icon />
          </span>
        )}
        <div className="help-topic-heading">
          {group && <p className="eyebrow">{group}</p>}
          <h2 className="title">{topic.title}</h2>
          {topic.text && <p className="lead">{topic.text}</p>}
        </div>
        <button type="button" className="copy-link" onClick={copy}>
          {copied ? <LuCheck aria-hidden="true" /> : <LuLink aria-hidden="true" />}
          <span aria-live="polite">{copied ? labels.copied : labels.copyLink}</span>
        </button>
      </header>
      <HelpSteps steps={topic.steps} stepLabel={labels.step} />
    </article>
  );
};

export default HelpTopic;
