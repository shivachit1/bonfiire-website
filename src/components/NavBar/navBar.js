import "./index.css";
import IconPNG from "./icon.png";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { languages, useContent, useLanguage } from "../../i18n";

// The logo and its name on the left; in the middle the links (Home, Organizers,
// Support, About; the Docs link was hidden 2026-11-01, the pages stay); on the right the language picker (a flag and EN, FI, SV) and the
// Download button. On phones those fold into a menu that slides
// down from the ☰ button.
// Small drawn flags for the language picker (SVG, so they look the same
// everywhere; emoji flags don't show on Windows). A language without one shows
// just its code.
const FLAGS = {
  en: (
    <>
      <rect width="24" height="16" fill="#1f3f8f" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#c8333b" strokeWidth="1.2" />
      <path d="M12 0V16M0 8H24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0V16M0 8H24" stroke="#c8333b" strokeWidth="3" />
    </>
  ),
  fi: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <path d="M0 8H24M9 0V16" stroke="#1f4e9a" strokeWidth="4" />
    </>
  ),
  sv: (
    <>
      <rect width="24" height="16" fill="#1f5fa6" />
      <path d="M0 8H24M9 0V16" stroke="#f2c230" strokeWidth="3.6" />
    </>
  ),
};

const Flag = ({ code }) =>
  FLAGS[code] ? (
    <svg className="nav-flag" viewBox="0 0 24 16" aria-hidden="true">
      <clipPath id="nav-flag-clip">
        <rect width="24" height="16" rx="2.5" />
      </clipPath>
      <g clipPath="url(#nav-flag-clip)">{FLAGS[code]}</g>
    </svg>
  ) : null;

const Navbar = () => {
  const { nav } = useContent("ui");
  const { language, setLanguage } = useLanguage();
  // The pill takes the colour that stands out from the band under it: the
  // light colour over a cream band, the cream over a light one ("cream" /
  // "light" in data-over, NavBar/index.css). It looks at what sits just under
  // the pill's middle as the page scrolls, and changes with a short fade.
  const { pathname } = useLocation();
  const headerRef = useRef(null);
  const [over, setOver] = useState("cream");
  const [strip, setStrip] = useState(null);
  useEffect(() => {
    const probe = document.createElement("span");
    probe.style.cssText =
      "position:absolute;visibility:hidden;background:var(--building-top)";
    document.body.appendChild(probe);
    const lightRgb = getComputedStyle(probe).backgroundColor;
    probe.remove();
    let frame = 0;
    // The colour of the first thing with a background under the point (not the
    // navbar itself), or null where only the blank page is.
    const colourAt = (y) => {
      const stack = document.elementsFromPoint(window.innerWidth / 2, y);
      for (const el of stack) {
        if (headerRef.current?.contains(el)) continue;
        if (el === document.documentElement || el === document.body) continue;
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg)) {
          return bg;
        }
      }
      return null;
    };
    const update = () => {
      frame = 0;
      // At the very top the bar's own strip is over the blank page (white, on
      // the page behind): it takes the colour of the band just under it, so the
      // sides of the pill match the page.
      const under = colourAt(40);
      const below = under || colourAt(window.innerHeight > 200 ? 100 : 40);
      setStrip(under ? null : below);
      if (below) setOver(below === lightRgb ? "light" : "cream");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // The phone menu: closes after navigating, on Escape or on a click outside.
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);

  // Scrolling down slides the bar up out of the way, scrolling up brings it
  // straight back (it stays while the phone menu is open or near the top).
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > 120 && y > last && !menuOpen);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    const onClick = (event) =>
      !headerRef.current?.contains(event.target) && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={`navbar-container${hidden ? " is-hidden" : ""}`}
      data-over={over}
      style={strip ? { background: strip } : undefined}
    >
      <nav className="navbar" aria-label={nav.label}>
        <Link to="/" className="nav-logo" aria-label={nav.brand}>
          <img className="nav-icon" src={IconPNG} alt="" />
          <span className="nav-brand">{nav.brand}</span>
        </Link>

        <button
          type="button"
          className={`nav-toggle ${menuOpen ? "is-open" : ""}`}
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          aria-label={menuOpen ? nav.closeMenu : nav.openMenu}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div id="nav-menu" className={`nav-actions ${menuOpen ? "is-open" : ""}`}>
          <div className="nav-links">
            <NavLink className="nav-link" to="/" end>
              {nav.home}
            </NavLink>
            <NavLink className="nav-link" to="/organizers">
              {nav.organizers}
            </NavLink>
            <NavLink className="nav-link" to="/help">
              {nav.help}
            </NavLink>
            <NavLink className="nav-link" to="/about">
              {nav.about}
            </NavLink>
          </div>
          <div className="nav-end">
          <label className="nav-language">
            <Flag code={language} />
            <select
              aria-label={nav.language}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {languages.map((option) => (
                <option key={option.code} value={option.code} title={option.name}>
                  {option.code.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <Link className="nav-download" to="/download">
            {nav.download}
          </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
