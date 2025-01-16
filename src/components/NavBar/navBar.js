import HamburgerMenu from "../HamburgerMenu/hamBurgerMenu";
import "./index.css";
import React from "react";
import { Link } from "react-scroll";

const Navbar = () => {
  const hideResponsiveNav = () => {
    const menu = document.querySelector(".menu");
    const links = document.querySelector(".nav-links");
    links.classList.toggle("active");
    menu.classList.toggle("change");
  };

  return (
    <nav>
      <a href="/">
        <h1>Bonfiire</h1>
      </a>
    </nav>
  );
};

export default Navbar;
