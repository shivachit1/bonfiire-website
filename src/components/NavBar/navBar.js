import "./index.css";
import IconPNG from "./icon.png";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const Navbar = () => {
  return (
    <header className="navbar-container">
      <nav className="navbar">
        <Link to="/" className="nav-logo">
          <img className="nav-icon" src={IconPNG} alt="Bonfiire Icon" />
          <span className="logo-text">Bonfiire</span>
        </Link>

        <div className="nav-links">
          <Link to="/download" className="nav-cta">
            <span>Get App</span>
            <FaArrowRight size={14} className="cta-arrow" />
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
