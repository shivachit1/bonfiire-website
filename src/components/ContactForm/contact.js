import React from "react";
import "./index.css";

const Contact = () => {
  return (
    <div className="contact">
      <div className="divider"></div>
      <div>
        <h2>Contact us</h2>
        <p>Bonfiire Oy</p>
        <div className="email-div">
          <p>Email :</p>
          <a className="link" href="mailto:support@bonfiire.io">
            <p>info@gmail.com</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
