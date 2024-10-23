import React from "react";
import "./index.css";

const Contact = () => {
  return (
    <div className="contact">
      <div className="divider"></div>
      <div>
        <h2>Contact us</h2>
        <p>RecordKeep Oy</p>
        <div className="email-div">
          <p>Email :</p>
          <a className="link" href="mailto:gopalkandel@gmail.com">
            <p>gopalkandel@gmail.com</p>
          </a>
        </div>

        <p>Address : Linintontie 10 R 163, 00940 Helsinki</p>
      </div>
    </div>
  );
};

export default Contact;
