import "./layout.css";
import { image } from "../content/content";
import Heading from "./Heading";

// Partner logos (or names) scrolling right to left in an endless loop.
// items: [{ name, logo?, url? }]; cta: the "Grab yours" tile after them (Cta) — without a logo, the name is shown as text.
// The list is repeated so one pass is always wider than the screen, then drawn
// twice; sliding by exactly one copy makes the loop seamless. With only a few
// partners the repeats would be obvious, so they show as a still, centred row.
const MIN_PER_PASS = 10;
const MIN_TO_SCROLL = 6;

const Mark = ({ item }) => {
  const mark = item.logo ? (
    <img
      src={image(item.logo)}
      alt={item.name}
      loading="lazy"
    />
  ) : (
    <span className="logo-name">{item.name}</span>
  );
  return item.url ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer">
      {mark}
    </a>
  ) : (
    mark
  );
};

// "Grab yours": a dashed tile after the logos inviting the next association
// (a mailto: link), { text, label, href }.
const Cta = ({ cta }) => (
  <a className="logo-cta" href={cta.href}>
    <span className="logo-cta-text">{cta.text}</span>
    <span className="logo-cta-label">{cta.label}</span>
  </a>
);

const LogoStrip = ({ title, items, cta }) => {
  if (items.length < MIN_TO_SCROLL) {
    return (
      <div className="logo-strip">
        {title && (
          <Heading as="h2" size="section" className="logo-strip-title">
            {title}
          </Heading>
        )}
        <ul className="logo-list logo-row">
          {items.map((item) => (
            <li key={item.name}>
              <Mark item={item} />
            </li>
          ))}
          {cta && (
            <li>
              <Cta cta={cta} />
            </li>
          )}
        </ul>
      </div>
    );
  }

  const repeats = Math.ceil(MIN_PER_PASS / items.length);
  const pass = Array.from({ length: repeats }, () => items).flat();

  return (
    <div className="logo-strip">
      {title && (
          <Heading as="h2" size="section" className="logo-strip-title">
            {title}
          </Heading>
        )}
      <div className="marquee" style={{ "--duration": `${pass.length * 3}s` }}>
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            // The second copy only exists for the loop, so screen readers skip it.
            <ul key={copy} className="logo-list" aria-hidden={copy === 1 || undefined}>
              {pass.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  <Mark item={item} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      {cta && <Cta cta={cta} />}
    </div>
  );
};

export default LogoStrip;
