import "./index.css";
import React from "react";
import IconPNG from "./icon.png";

const Navbar = () => {
  return (
    <nav className="nav">
      <div className="nav_links">
        <a href="/">
          <img style={{ width: 40, height: 40 }} src={IconPNG} alt="icon" />
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
