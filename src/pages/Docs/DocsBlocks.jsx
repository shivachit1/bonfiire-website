import { Fragment, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LuInfo, LuLightbulb } from "react-icons/lu";
import { asset, image } from "../../content/content";
import ServiceScene from "../../layout/ServiceScenes";

// Screenshot placeholders only show while developing (npm start), never live.
const showPlaceholders = process.env.NODE_ENV === "development";

// Where a [link](target) in docs text goes:
//   category/page(#section)  another docs page   -> /help-docs/category/page
//   #section                 a section of this page
//   /path                    any page of the site
//   https://...              another site (opens in a new tab)
const DocsLink = ({ to, className = "docs-link", children }) => {
  if (/^https?:\/\//.test(to)) {
    return (
      <a
        className={className}
        href={to}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  if (to.startsWith("#")) {
    return (
      <a className={className} href={to}>
        {children}
      </a>
    );
  }
  const path = to.startsWith("/") ? to : `/help-docs/${to}`;
  return (
    <Link className={className} to={path}>
      {children}
    </Link>
  );
};

// **Bold** words and [links](target) inside a line of docs text.
const inlinePattern = /(\*\*.+?\*\*|\[[^\]]+\]\([^)\s]+\))/;
export const inline = (text) =>
  text.split(inlinePattern).map((part, i) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      return (
        <DocsLink key={i} to={link[2]}>
          {link[1]}
        </DocsLink>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });

// Docs text as plain words (bold marks and link targets taken out), for search.
export const plainText = (text) =>
  text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1");

// A step's screenshot in a phone frame; while developing, a labelled
// placeholder where one is still missing.
const Shot = ({ step }) => {
  if (step.screenshot) {
    return (
      <img
        className="docs-shot"
        src={image(step.screenshot)}
        alt={step.title || step.screenshotHint || ""}
        loading="lazy"
      />
    );
  }
  if (showPlaceholders && step.screenshotHint) {
    return (
      <span className="docs-shot docs-shot--placeholder">
        Screenshot: {step.screenshotHint}
      </span>
    );
  }
  return null;
};

// A steps block's video in a phone frame: muted and looping, playing while it's
// in view and paused when it scrolls away. With reduced motion it doesn't play
// by itself (its first frame, or `poster`, with the controls). While
// developing, a labelled placeholder where the video is still missing.
const reducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const StepsVideo = ({ block }) => {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || reducedMotion() || !("IntersectionObserver" in window)) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [block.video]);

  if (block.video) {
    return (
      <video
        ref={ref}
        className="docs-video"
        src={asset(block.video)}
        poster={block.poster ? image(block.poster) : undefined}
        aria-label={block.videoHint}
        muted
        loop
        playsInline
        controls
        preload="metadata"
      />
    );
  }
  if (showPlaceholders && block.videoHint) {
    return (
      <span className="docs-video docs-video--placeholder">
        Video: {block.videoHint}
      </span>
    );
  }
  return null;
};

// One block of a docs section, by its `type`:
//   p      a paragraph            { text }
//   list   a bullet list          { items: [text] }
//   steps  numbered steps         { items: [{ title?, text, note?, screenshot?, screenshotHint? }],
//          (`note`: a line to look out for, highlighted under the step's text)
//                                   video?, poster?, videoHint? }
//          With `video` (a file in public/, e.g. "/docs/videos/sign-up.mp4"; ""
//          while it's still to come) the steps sit beside one video instead of
//          a screenshot each: video first on phones, on the right on desktop.
//   tip    a tip box              { text }
//   note   a note box             { text }
//   cards  linked cards, each with a little map drawing on top
//          { items: [{ scene, title, text, to }] } (scene: a ServiceScenes name,
//          e.g. "venue" or "map"; to: a link target as for [links])
// Text can have **bold** words and [links](target) (see DocsLink above).
const DocsBlock = ({ block, labels }) => {
  switch (block.type) {
    case "p":
      return <p className="docs-p">{inline(block.text)}</p>;
    case "list":
      return (
        <ul className="docs-list">
          {block.items.map((item) => (
            <li key={item}>{inline(item)}</li>
          ))}
        </ul>
      );
    case "steps": {
      const withVideo = "video" in block;
      const steps = (
        <ol className="docs-steps">
          {block.items.map((step, i) => (
            <li key={i} className="docs-step">
              <span className="docs-step-number" aria-hidden="true">
                {i + 1}
              </span>
              <div className="docs-step-body">
                {step.title && <p className="docs-step-title">{step.title}</p>}
                <p className="docs-step-text">{inline(step.text)}</p>
                {step.note && (
                  <p className="docs-step-note">
                    <LuInfo
                      className="docs-step-note-icon"
                      aria-hidden="true"
                    />
                    <span>{inline(step.note)}</span>
                  </p>
                )}
              </div>
              {!withVideo && <Shot step={step} />}
            </li>
          ))}
        </ol>
      );
      if (!withVideo) return steps;
      return (
        <div className="docs-walkthrough">
          <div className="docs-walkthrough-video">
            <StepsVideo block={block} />
          </div>
          {steps}
        </div>
      );
    }
    case "cards":
      return (
        <ul className="docs-cards">
          {block.items.map((card, i) => (
            <li key={card.title} style={{ "--i": i }}>
              <DocsLink to={card.to} className="docs-card">
                <span className="docs-card-figure">
                  <ServiceScene name={card.scene} />
                </span>
                <span className="docs-card-title">{card.title}</span>
                <span className="docs-card-text">{inline(card.text)}</span>
              </DocsLink>
            </li>
          ))}
        </ul>
      );
    case "tip":
    case "note": {
      const Icon = block.type === "tip" ? LuLightbulb : LuInfo;
      return (
        // No "Tip" / "Note" word shown, only the icon and colour; screen
        // readers still hear which it is.
        <aside
          className={`docs-callout docs-callout--${block.type}`}
          aria-label={labels[block.type]}
        >
          <Icon className="docs-callout-icon" aria-hidden="true" />
          <p>{inline(block.text)}</p>
        </aside>
      );
    }
    default:
      return null;
  }
};

export default DocsBlock;
