import "./index.css";
import IconPNG from "./icon.png";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { languages, useContent, useLanguage } from "../../i18n";

// The logo on the left; on the right plain links (Help, Docs, Download) and the
// language picker (EN, FI, SV). On phones those fold into a menu that slides
// down from the ☰ button.
const Navbar = () => {
  const { nav } = useContent("ui");
  const { language, setLanguage } = useLanguage();
  // Once the page scrolls, a hairline appears under the bar.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The phone menu: closes after navigating, on Escape or on a click outside.
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const headerRef = useRef(null);
  useEffect(() => setMenuOpen(false), [pathname]);
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
      className={`navbar-container ${scrolled || menuOpen ? "is-scrolled" : ""}`}
    >
      <nav className="navbar" aria-label={nav.label}>
        <Link to="/" className="nav-logo">
          <img className="nav-icon" src={IconPNG} alt="" />
          <span className="logo-text">Bonfiire.io</span>
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
          <NavLink className="nav-link" to="/help">
            {nav.help}
          </NavLink>
          <NavLink className="nav-link" to="/help-docs">
            {nav.docs}
          </NavLink>
          <NavLink className="nav-link" to="/download">
            {nav.download}
          </NavLink>
          <label className="nav-language">
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
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
