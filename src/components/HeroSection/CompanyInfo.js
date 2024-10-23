import React from "react";
import "./index.css";
import { ReactComponent as SvgImage } from "./svgImage.svg"; // Adjust the path to your SVG
import { Link } from "react-scroll";

export const CompanyInfo = () => {
  return (
    <div className="heroSection">
      <div className="heroSection_content">
        <h1>Trusted Partner in Financial Success</h1>
        <p>
          At RecordKeep, we offer tailored accounting solutions designed to meet
          the unique needs of your business. From bookkeeping to tax
          preparation, our expert team is here to help you thrive.
        </p>
        <button>
          <Link
            to="contact"
            spy={true}
            smooth={true}
            offset={-100}
            duration={500}
          >
            Contact Us
          </Link>
        </button>
      </div>

      <SvgImage className="hero-icon" />
    </div>
  );
};
