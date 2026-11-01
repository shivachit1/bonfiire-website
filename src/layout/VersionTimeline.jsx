import { useState } from "react";
import "./layout.css";
import Intro from "./Intro";
import Tabs from "./Tabs";
import useReveal from "./useReveal";

// What we started with and what we have shipped since (the About page): the
// versions of the app from the first, one under the other along a dotted line,
// each with its number and date and its release notes, word for word as in the
// App Store's version history. They rise in one after another when they come into
// view. A link under them to the full history in the store.
//   title, text  the heading and the line
//   platforms    [{ id, label, versions }]: a tab for each app (iOS, Android),
//                switching the list; versions: [{ version, date, notes: [{ heading?,
//                text }] }], oldest first (`upcoming`: not shipped yet, drawn as an empty dot,
//                with its `tag`, e.g. "Coming up");
//                the notes word for word as in the App Store (none for 1.0)
//   ask          { text, label, email, subject, body: [lines] }: "anything to add?"
//                and a button that opens an email to us, its subject and outline filled in
//   link         { label, href }
const VersionTimeline = ({
  title,
  text,
  platforms = [],
  platformsLabel,
  link,
  ask,
}) => {
  const [ref, visible] = useReveal();
  const [platform, setPlatform] = useState(platforms[0]?.id);
  const shown = platforms.find((item) => item.id === platform) || platforms[0];
  const versions = shown?.versions || [];
  return (
    <section className="section version-band">
      <div className="container container--wide">
        <Intro layout="left" title={title} text={text ? [text] : []} />
        {platforms.length > 1 && (
          <Tabs
            tabs={platforms}
            active={shown.id}
            onChange={setPlatform}
            label={platformsLabel}
          />
        )}
        <ol
          ref={ref}
          id={`panel-${shown.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${shown.id}`}
          className={`version-list${visible ? " is-visible" : ""}`}
        >
          {versions.map((version, i) => (
            <li
              key={version.version}
              className={`version-item${version.upcoming ? " is-upcoming" : ""}`}
              style={{ "--i": i }}
            >
              <span className="version-meta">
                <span className="version-number">
                  Version {version.version}
                </span>
                {version.tag && (
                  <span className="version-tag">{version.tag}</span>
                )}
                <span className="version-date">{version.date}</span>
              </span>
              {version.notes.length > 0 && (
                <ul className="version-changes">
                  {version.notes.map((note) => (
                    <li key={note.text}>
                      {note.heading && (
                        <strong className="version-heading">
                          {note.heading}
                        </strong>
                      )}
                      {note.text}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
        {ask && (
          <div className="version-ask">
            <p className="version-ask-text">{ask.text}</p>
            <a
              className="button-primary"
              href={`mailto:${ask.email}?subject=${encodeURIComponent(
                ask.subject,
              )}&body=${encodeURIComponent(ask.body.join("\n"))}`}
            >
              {ask.label}
            </a>
          </div>
        )}
        {link && (
          <p className="version-link">
            <a
              className="text-link"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          </p>
        )}
      </div>
    </section>
  );
};

export default VersionTimeline;
