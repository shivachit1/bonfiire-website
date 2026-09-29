import "./index.css";
import IconPNG from "./icon.png";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LuGlobe } from "react-icons/lu";
import { languages, useContent, useLanguage } from "../../i18n";

// Links come from src/content/<language>/navigation.json. An item with `children`
// becomes a dropdown on desktop and a labelled group in the mobile menu.
const Navbar = () => {
  const navigation = useContent("navigation");
  const { nav } = useContent("ui");
  const { language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const { pathname } = useLocation();
  const navRef = useRef(null);

  // Close after navigating to another page.
  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  // Close on Escape or a click outside the navbar.
  useEffect(() => {
    const closeAll = () => {
      setMenuOpen(false);
      setOpenGroup(null);
    };
    const onKey = (event) => event.key === "Escape" && closeAll();
    const onClick = (event) => !navRef.current?.contains(event.target) && closeAll();
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <header className="navbar-container" ref={navRef}>
      <nav className="navbar" aria-label={nav.label}>
        <Link to="/" className="nav-logo">
          <img className="nav-icon" src={IconPNG} alt="" />
          <span className="logo-text">Bonfiire.io</span>
        </Link>

        <button
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

        <ul id="nav-menu" className={`nav-menu ${menuOpen ? "is-open" : ""}`}>
          {navigation.map((item) =>
            item.children ? (
              <li
                key={item.label}
                className={`nav-group ${
                  item.children.some((child) => pathname.startsWith(child.to)) ? "active" : ""
                }`}
              >
                <button
                  className="nav-link nav-group-toggle"
                  aria-expanded={openGroup === item.label}
                  onClick={() =>
                    setOpenGroup((group) => (group === item.label ? null : item.label))
                  }
                >
                  {item.label}
                  <span className="nav-caret" aria-hidden="true">
                    ▾
                  </span>
                </button>
                <ul className={`nav-submenu ${openGroup === item.label ? "is-open" : ""}`}>
                  {item.children.map((child) => (
                    <li key={child.to}>
                      <NavLink className="nav-sublink" to={child.to}>
                        <span className="nav-sublink-label">{child.label}</span>
                        {child.description && (
                          <span className="nav-sublink-hint">{child.description}</span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={item.to}>
                <NavLink className="nav-link" to={item.to} end>
                  {item.label}
                </NavLink>
              </li>
            ),
          )}
          <li className="nav-language">
            <LuGlobe aria-hidden="true" />
            <select
              aria-label={nav.language}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {languages.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
