import "./index.css";

const PrivacyPolicy = () => {
  return (
    <div className="privacyContainer">
      <header>
        <h1 style={{ textAlign: "left", marginTop: "30px" }}>Privacy Policy</h1>
        <i>Last updated: 2026-01-10</i>
      </header>

      <section>
        <h2 style={{ marginTop: "30px" }}>1. Introduction</h2>
        <div className="pDiv">
          <p>
            Welcome to Bonfiire! We value your privacy and are committed to
            protecting your personal information. This Privacy Policy outlines
            how we collect, use, and safeguard your information when you use
            Bonfiire’s services (referred to as “Bonfiire,” “we,” or “our”). By
            using Bonfiire, you agree to the practices described here.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          2. Information We Collect and Use
        </h2>
        <div className="pDiv">
          <p>
            We collect data to provide a functional, safe, and social
            experience. We categorize the data we process as follows:
          </p>
        </div>

        <section style={{ textAlign: "left", marginTop: "20px" }}>
          <h3>2.1 Personal Data</h3>
          <div className="pDiv">
            <p>
              To create a social ecosystem, we require specific identifiers:
            </p>
          </div>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>
              <h3>Name</h3>
            </li>
            <div className="pDiv">
              <p>
                Displayed on your profile, shared with other users on the
                Bonfiire platform, and used in email while communicating with
                you.
              </p>
            </div>
            <li>
              <h3>Email Address</h3>
            </li>
            <div className="pDiv">
              <p>
                Serves as your primary account identifier, used for secure
                login, and sending critical service updates or usage
                instructions.
              </p>
            </div>
            <li>
              <h3>Phone Number</h3>
            </li>
            <div className="pDiv">
              <p>
                Utilized as a secondary authentication factor to ensure account
                uniqueness and security.
              </p>
            </div>
            <li>
              <h3>Gender</h3>
            </li>
            <div className="pDiv">
              <p>
                Used for filtering events, hangouts based on your preferences
              </p>
            </div>
            <li>
              <h3>Date of Birth</h3>
            </li>
            <div className="pDiv">
              <p>
                Used for age verification and filtering events, hangouts, and
                services based on your criteria.
              </p>
            </div>
            <li>
              <h3>Profile Picture</h3>
            </li>
            <div className="pDiv">
              <p>
                Displayed in your profile and shared with other users on the
                Bonfiire platform to showcase your presence.
              </p>
            </div>
          </ul>
        </section>

        <section style={{ textAlign: "left", marginTop: "30px" }}>
          <div style={{ textAlign: "left", marginTop: "30px" }}>
            <h3>2.2 Device Information</h3>
            <div className="pDiv">
              <p>
                When you access Bonfiire services, our servers automatically log
                technical data to ensure stability and security:
              </p>
            </div>
          </div>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>
              <h3>Device Type (e.g., iPhone, Android):</h3>
            </li>
            <div className="pDiv">
              <p>
                Identifies the manufacturer and model of your device to optimize
                app functionality and provide the best user experience for your
                device type.
              </p>
            </div>
            <li>
              <h3>Operating System (OS):</h3>
            </li>
            <div className="pDiv">
              <p>
                Helps ensure compatibility with your OS version and resolve
                issues specific to certain operating systems.
              </p>
            </div>
            <li>
              <h3>Unique Device Identifier:</h3>
            </li>
            <div className="pDiv">
              <p>
                Used for internal logging to identify and troubleshoot issues
                without storing sensitive data.
              </p>
            </div>
            <li>
              <h3> IP Address:</h3>
            </li>
            <div className="pDiv">
              <p>
                Processed for security auditing, DDoS protection, and to infer
                general geographical usage patterns (city/country level).
              </p>
            </div>
          </ul>
        </section>

        <section style={{ textAlign: "left", marginTop: "30px" }}>
          <h3>2.3 Location Data</h3>
          <div className="pDiv">
            <p>
              We prioritize a "Privacy-First" approach to location. Unlike other
              apps, we do not maintain a historical database of your movements.
            </p>
          </div>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>
              <h3>Real-Time Interaction:</h3>
            </li>
            <div className="pDiv">
              <p>
                With your permission, the app uses your device's GPS to center
                the map on your current location.
              </p>
            </div>

            <li>
              <h3>Map Bounds Processing:</h3>
            </li>
            <div className="pDiv">
              <p>
                When you navigate the map, the app sends the coordinates of the
                visible map area (bounds) to our server. Our server queries the
                database to return events/hangouts within those specific
                boundaries.
              </p>
            </div>

            <li>
              <h3>Non-Persistent Storage:</h3>
            </li>
            <div className="pDiv">
              <p>
                These coordinate requests are processed in real-time. We do not
                store or "track" where you have been; the data is discarded once
                the event list is delivered to your device.
              </p>
            </div>

            <li>
              <h3>Map Providers:</h3>
            </li>
            <div className="pDiv">
              <p>
                Our map features are powered by Google Maps. By using our map
                services, you also agree to be bound by their respective Privacy
                Policies.
              </p>
            </div>

            <li>
              <h3>Future Opt-In Features:</h3>
            </li>
            <div className="pDiv">
              <p>
                We may implement features for real-time location sharing between
                friends or event organizers. These will always require a
                separate, explicit "Opt-In" from you.
              </p>
            </div>
          </ul>
        </section>

        <section style={{ textAlign: "left", marginTop: "30px" }}>
          <h3>2.4 Events, hangouts & Social Content</h3>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>
              <h3>Public events/hangouts</h3>
            </li>
            <div className="pDiv">
              <p>
                Data related to public events/hangouts (location, description,
                time) is broadcast to all users whose map bounds overlap with
                the event location, and matches their filter preferences.
              </p>
            </div>

            <li>
              <h3>Private events/hangouts</h3>
            </li>
            <div className="pDiv">
              <p>
                Private events and hangouts will only be shared with invited
                users and will remain hidden from others on the platform.
              </p>
            </div>

            <li>
              <h3>Chat & Messaging</h3>
            </li>
            <div className="pDiv">
              <p>
                Chat messages between users are securely encrypted and stored.
                These are treated as private data and are not accessed by us
                except for legal compliance or reported violations.
              </p>
            </div>
          </ul>
        </section>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>3. Authentication & Tracking Technologies</h2>

        <div style={{ textAlign: "left", marginTop: "20px" }}>
          <h3>3.1 JSON Web Tokens (JWT)</h3>
          <div className="pDiv">
            <p>
              We do not use traditional browser-based tracking cookies. Instead,
              we utilize JSON Web Tokens (JWT).
            </p>
          </div>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>
              <h3>Purpose</h3>
            </li>
            <div className="pDiv">
              <p>
                These tokens are stored securely on your device to keep you
                authenticated. They allow you to use the app without re-entering
                your credentials for every session.
              </p>
            </div>
            <li>
              <h3>Security</h3>
            </li>
            <div className="pDiv">
              <p>
                These tokens are cryptographically signed to prevent tampering.
              </p>
            </div>
          </ul>
        </div>

        <div style={{ textAlign: "left", marginTop: "20px" }}>
          <h3>3.2 Analytics & Functional Data</h3>
          <div className="pDiv">
            <p>
              Currently, we do not utilize any in-house or third-party
              behavioral tracking. However, in future updates, we may implement
              basic analytics to monitor app performance and user engagement. We
              will always prioritize user privacy and provide clear options to
              opt-out of any tracking features.
            </p>
          </div>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>4. Third-Party Data Sharing</h2>
        <div className="pDiv">
          <p>
            We do not sell, rent, or trade your personal data to third parties
            for marketing purposes. We only disclose data in the following
            scenarios:
          </p>
        </div>

        <div style={{ textAlign: "left", marginTop: "20px" }}>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>
              <h3>Core Service Providers:</h3>
            </li>
            <div className="pDiv">
              <p>
                We use trusted infrastructure partners like Firebase and Amazon
                Web Services (AWS) to host our database and facilitate app
                functionality.
              </p>
            </div>
            <li>
              <h3>Legal Mandates:</h3>
            </li>
            <div className="pDiv">
              <p>
                We may disclose your information if we believe in good faith
                that such action is necessary to comply with a legal obligation,
                protect our rights, or ensure the safety of our users.
              </p>
            </div>
          </ul>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>5. Your Data Rights and Choices</h2>
        <div className="pDiv">
          <p>
            Our users in any country or regions have the right to access,
            correct, or delete their personal data. You can manage your
            information through the account settings or by contacting our
            support team.
          </p>
        </div>
        <section style={{ textAlign: "left", marginTop: "20px" }}>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>
              <h3>Request a copy of your personal data</h3>
            </li>
            <div className="pDiv">
              <p>
                Through our app, you can view and download the personal data we
                have collected about you. This includes your profile
                information, events/hangouts you have created or joined, and
                chat messages. Upon receiving your request, we will compile the
                data and provide it to you in a commonly used JSON format within
                1-4 days depending upon the volume of data requested.
              </p>
            </div>

            <li>
              <h3>Account Deletion</h3>
            </li>
            <div className="pDiv">
              <p>
                You can delete your Bonfiire account and all associated data at
                any time via the account settings within the app. Upon a
                deletion request, we will immediately deactivate your account
                and remove your personal data from our active databases within
                30 days.
              </p>
            </div>
          </ul>
        </section>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>6. GDPR or International Compliance</h2>
        <div className="pDiv">
          <p>
            If you are located in the European Union (EU), you have certain
            rights under the General Data Protection Regulation (GDPR) regarding
            your personal data. These rights include:
          </p>
        </div>
        <section style={{ textAlign: "left", marginTop: "20px" }}>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>
              <div className="pDiv">
                <p>The right to access your personal data.</p>
              </div>
            </li>
            <li>
              <div className="pDiv">
                <p>
                  The right to request the correction of inaccurate or
                  incomplete personal data.
                </p>
              </div>
            </li>
            <li>
              <div className="pDiv">
                <p>The right to request the deletion of your personal data.</p>
              </div>
            </li>
            <li>
              <div className="pDiv">
                <p>
                  The right to restrict or object to the processing of your
                  personal data.
                </p>
              </div>
            </li>
            <li>
              <div className="pDiv">
                <p>The right to data portability.</p>
              </div>
            </li>
          </ul>
        </section>
        <div className="pDiv">
          <p>
            To exercise these rights or if you have any questions regarding how
            we process your data, please contact us at{" "}
            <a href="mailto:support@bonfiire.io">support@bonfiire.io</a>
          </p>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>7. Data Retention</h2>
        <div className="pDiv">
          <p>
            We retain your personal data only for as long as your account is
            active or as needed to provide you with services. We may retain
            certain data longer if required for legal or accounting purposes.
          </p>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>8. Security Measures</h2>
        <div className="pDiv">
          <p>
            We take the security of your personal information seriously and use
            commercially reasonable measures (including SSL/TLS encryption) to
            protect it. However, please note that no method of transmission over
            the internet or electronic storage is 100% secure. We cannot
            guarantee absolute protection, and we encourage users to take
            precautions to protect their own account information.
          </p>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>9. Age Restriction</h2>
        <div className="pDiv">
          <p>
            Bonfiire is not intended for users under 18. We do not knowingly
            collect personal information from minors. If we learn that we have
            inadvertently collected information from a child under 18, we will
            take immediate steps to delete such information and terminate the
            associated account.
          </p>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>10. Changes to This Privacy Policy</h2>
        <div className="pDiv">
          <p>
            We may update this policy periodically. Significant changes will be
            communicated through the app or via email. Continued use of the app
            signifies acceptance of the updated terms.
          </p>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>Contact Us</h2>
        <div className="pDiv">
          <p>
            For questions, privacy inquiries, or any other concerns, please
            contact us at:{" "}
            <a href="mailto:support@bonfiire.io">support@bonfiire.io</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
