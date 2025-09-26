import React from "react";
import { FaEnvelope } from "react-icons/fa";
import "./index.css"; // Dedicated CSS for this section
import SectionHeader from "../Header/Header";

const ContactSupport = ({ title, subtitle }) => {
  const SUPPORT_EMAIL = "support@bonfiire.io"; // 💡 Change this to your actual support email
  const EMAIL_SUBJECT = "Bonfiire App Download Assistance";

  // Construct the mailto link
  const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    EMAIL_SUBJECT
  )}`;

  return (
    <article className="contact-support-article">
      <section className="contact-support-section">
        <SectionHeader title={title} subtitle={subtitle} />

        <a href={mailtoLink} className="contact-support-button">
          <FaEnvelope className="button-icon" />
          <span>Email Our Support Team</span>
        </a>

        <p className="contact-support-note">
          Average response time: 15-30 minutes.
        </p>
      </section>
    </article>
  );
};

export default ContactSupport;
