import "./index.css";
import IconPNG from "./icon.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar-container">
      <nav className="navbar">
        <Link to="/" className="nav-logo">
          <img className="nav-icon" src={IconPNG} alt="Bonfiire Icon" />
          <span className="logo-text">Bonfiire.io</span>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
