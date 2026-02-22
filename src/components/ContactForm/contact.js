import { FaEnvelope } from "react-icons/fa";
import "./index.css";
import SectionHeader from "../Header/Header";

const ContactSupport = ({ title, subtitle }) => {
  const SUPPORT_EMAIL = "support@bonfiire.io";
  const EMAIL_SUBJECT = "Bonfiire App Download Assistance";

  const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    EMAIL_SUBJECT,
  )}`;

  return (
    <article className="contact-support-wrapper">
      <section className="contact-support-section">
        <SectionHeader title={title} subtitle={subtitle} />

        <div className="contact-action-area">
          <a href={mailtoLink} className="contact-support-button">
            <FaEnvelope className="button-icon" />
            <span>Contact Support Team</span>
          </a>

          <p className="contact-support-note">
            Average response time: <strong>15-30 minutes</strong>.
          </p>
        </div>
      </section>
    </article>
  );
};

export default ContactSupport;
