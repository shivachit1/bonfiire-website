import React from "react";
import "./index.css";

const Contact = () => {
  return (
    <div className="contact">
      <div className="divider"></div>
      <div>
        <h3>Contact us</h3>
        <div className="email-div">
          <p>Email :</p>
          <a className="link" href="mailto:support@bonfiire.io">
            <p>support@bonfiire.io</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
