import React from "react";
import "./index.css";

const PrivacyPolicy = () => {
  return (
    <div className="privacyContainer">
      <header>
        <h1 style={{ textAlign: "left", marginTop: "30px" }}>Privacy Policy</h1>
        <i>Created: 2025-01-22</i>
      </header>

      <section>
        <h2 style={{ marginTop: "30px" }}>1. Introduction</h2>
        <div className="pDiv">
          <p>
            Welcome to Bonfiire! We value your privacy and are committed to
            protecting your personal information. This Privacy Policy outlines
            how we collect, use, disclose, and safeguard your information when
            you use Bonfiire’s services (referred to as “Bonfiire,” “we,” or
            “our”). By using Bonfiire, you agree to the practices described in
            this Privacy Policy.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          2. Information We Collect and Use
        </h2>
        <div className="pDiv">
          <p>
            When you register or use Bonfiire services, we may collect the
            following types of information:
          </p>
        </div>

        <section style={{ textAlign: "left", marginTop: "20px" }}>
          <h3>2.1 Personal Data</h3>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>Name</li>
            <div className="pDiv">
              <p>
                Your name will be displayed in your profile, shared with other
                users on the Bonfiire platform, and will be used to contact you
                via email for important updates, offers, or notifications.
              </p>
            </div>
            <li>Email Address</li>
            <div className="pDiv">
              <p>
                Used for signing in, identifying you while using our services,
                and sending you updates, offers, and usage instructions via
                email.
              </p>
            </div>
            <li>Phone Number</li>
            <div className="pDiv">
              <p>
                Used for signing in, and identify you while using our services.
              </p>
            </div>
            <li>Gender</li>
            <div className="pDiv">
              <p>
                Used to filter events, hangouts, and services based on your
                preferences
              </p>
            </div>
            <li>Date of Birth</li>
            <div className="pDiv">
              <p>
                Used for age verification and filtering events, hangouts, and
                services based on your criteria.
              </p>
            </div>
            <li>Profile Picture</li>
            <div className="pDiv">
              <p>
                Profile picture will be displayed in your profile and shared
                with other users on the Bonfiire platform.
              </p>
            </div>
          </ul>
        </section>

        <section style={{ textAlign: "left", marginTop: "30px" }}>
          <div style={{ textAlign: "left", marginTop: "30px" }}>
            <h3>2.2 Device Information</h3>
            <div className="pDiv">
              <p>
                We automatically collect information about your device when you
                use our app, including:
              </p>
            </div>
          </div>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>
              Device Type (e.g., iPhone, Android):
              <div className="pDiv">
                <p>
                  Identifies the manufacturer and model of your device to
                  optimize app functionality and provide the best user
                  experience for your device type.
                </p>
              </div>
            </li>
            <li>
              Operating System Version:
              <div className="pDiv">
                <p>
                  Helps ensure compatibility with your OS version and resolve
                  issues specific to certain operating systems.
                </p>
              </div>
            </li>
            <li>
              Unique Device Identifier:
              <div className="pDiv">
                <p>
                  Used for internal logging to identify and troubleshoot issues
                  without storing sensitive data.
                </p>
              </div>
            </li>
            <li>
              IP Address:
              <div className="pDiv">
                <p>
                  Used for security purposes, such as detecting malicious
                  activity and understanding geographical usage patterns.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section style={{ textAlign: "left", marginTop: "30px" }}>
          <h3>2.3 Location Data</h3>
          <div className="pDiv">
            <p>
              With your permission, we use your real-time location to provide
              services like location-sharing with event participants and
              suggesting nearby events. We also collect location data when you
              open and close the app to enhance functionality. You can enable or
              disable location services at any time through your device
              settings.
            </p>
          </div>
        </section>

        <section style={{ textAlign: "left", marginTop: "30px" }}>
          <h3>2.4 Events/hangouts data</h3>
          <div className="pDiv">
            <p>
              Here are the some measure which we strictly carry out for you
              events/hangouts
            </p>
          </div>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>Public events/hangouts</li>
            <div className="pDiv">
              <p>
                Public events and hangouts will be shared on maps based on
                location. Users will see these events if they meet their
                criteria and preferences.
              </p>
            </div>
            <li>Private events/hangouts</li>
            <div className="pDiv">
              <p>
                Private events and hangouts will only be shared with invited
                users and will remain hidden from others on the platform.
              </p>
            </div>
          </ul>
        </section>

        <section style={{ textAlign: "left", marginTop: "30px" }}>
          <h3>2.5 Chat room and messages</h3>
          <div className="pDiv">
            <p>
              Chat messages between users are securely encrypted and stored. In
              rare cases, such as legal investigations, messages may be reviewed
              if required by law, but your privacy and security remain our top
              priorities.
            </p>
          </div>
        </section>

        <section style={{ textAlign: "left", marginTop: "30px" }}>
          <h3>2.6 Activity Data</h3>
          <div className="pDiv">
            <p>
              We collect information about how often you use the app and your
              activities within it. This helps us understand which features you
              enjoy, improve your experience, and enhance the app’s
              functionality.
            </p>
          </div>
        </section>

        <section style={{ textAlign: "left", marginTop: "30px" }}>
          <h3>2.7 Payment Information</h3>
          <div className="pDiv">
            <p>
              Currently, our app does not process payments or handle payment
              data. In the future, we may introduce features involving in-app
              purchases or payment processing. When this occurs, payment
              information (e.g., credit card details) will be securely handled
              by trusted third-party payment processors, and we will update this
              policy to provide full details.
            </p>
          </div>
        </section>

        <section style={{ textAlign: "left", marginTop: "30px" }}>
          <h3>2.8 Analytics and Functional Data</h3>
          <div className="pDiv">
            <p>
              We use analytics to understand how our services are being used and
              identify areas for improvement:
            </p>
          </div>

          <div style={{ textAlign: "left", marginTop: "20px" }}>
            <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
              <li>App Usage Frequency</li>
              <div className="pDiv">
                <p>
                  We track how often you open the app to understand our active
                  user base.
                </p>
              </div>
              <li>Platform Activity</li>
              <div className="pDiv">
                <p>
                  Monitoring your activity helps us improve features, tailor
                  recommendations, and provide a personalized experience.
                </p>
              </div>
              <li>Email Interaction</li>
              <div className="pDiv">
                <p>
                  We analyze email open rates and link clicks to determine the
                  effectiveness of our communications and provide more relevant
                  updates and offers.
                </p>
              </div>
              <li>Website Visits (Anonymous)</li>
              <div className="pDiv">
                <p>
                  We track website visits to measure the success of campaigns
                  and improve content relevance.
                </p>
              </div>
            </ul>
          </div>
        </section>
      </section>
      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>3. Third Parties</h2>
        <div className="pDiv">
          <p>
            We do not sell your data. Your information is shared only in the
            following cases:
          </p>
        </div>

        <div style={{ textAlign: "left", marginTop: "20px" }}>
          <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
            <li>Service Providers:</li>
            <div className="pDiv">
              <p>
                We may share information with trusted service providers who
                assist with app functionality (e.g., firebase, amazon web
                services).
              </p>
            </div>
            <li>Legal Compliance:</li>
            <div className="pDiv">
              <p>
                Your information may be shared if required by law, such as for
                legal investigations or compliance with applicable regulations.
              </p>
            </div>
          </ul>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>4. Your Data Rights and Choices</h2>
        <div className="pDiv">
          <p>
            You have full control over your personal data. Here’s how you can
            manage your information:
          </p>
        </div>

        <section style={{ textAlign: "left", marginTop: "20px" }}>
          <h3>4.1 Account Deactivation</h3>
          <div className="pDiv">
            <p>
              If you wish to deactivate your account, you can do so directly
              through the app. Your account will be scheduled for deletion after
              30 days. If you log back in within this period, your account and
              data will be restored.
            </p>
          </div>
        </section>

        <section style={{ textAlign: "left", marginTop: "10px" }}>
          <h3>4.2 Data Access and Deletion</h3>
          <div className="pDiv">
            <p>
              You can request access to your personal data or ask for its
              deletion at any time. To do so, please contact our support team,
              and we will assist you in accessing, updating, or deleting your
              information. If your account is deactivated, you can confirm the
              status of your data or request deletion through support as well.
            </p>
          </div>
        </section>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>5. Security</h2>
        <div className="pDiv">
          <p>
            We take the security of your personal information seriously and use
            commercially reasonable measures to protect it. However, please note
            that no method of transmission over the internet or electronic
            storage is completely secure. While we strive to implement strong
            security protocols, we cannot guarantee 100% protection against all
            potential threats, including unauthorized access, data breaches, or
            loss. We are continuously working to enhance the security of our
            systems, but users should also take precautions to protect their own
            information.
          </p>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>6. UnderAge Users privacy</h2>
        <div className="pDiv">
          <p>
            Bonfiire is not intended for users under the age of 18. We do not
            knowingly collect personal information from those users. If we learn
            that we have collected data from a user under 18, we will delete
            that information immediately.
          </p>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>7. Cookies and Tracking Technologies</h2>
        <div className="pDiv">
          <p>
            Cookies are small text files that are placed on your device to
            collect standard internet log information and visitor behavior
            information. When you visit our website or use our services, we may
            automatically collect information from you using cookies or similar
            technologies (such as web beacons, pixel tags, and device
            identifiers). For more information on cookies, please visit:{" "}
            <a href="allaboutcookies.org">allaboutcookies.org</a>
          </p>
        </div>

        <section style={{ textAlign: "left", marginTop: "20px" }}>
          <h3>How Do We Use Cookies?</h3>
          <div className="pDiv">
            <p>
              We use cookies in several ways to enhance your experience on our
              website and services. This includes:
            </p>
          </div>
          <div style={{ textAlign: "left", marginTop: "20px" }}>
            <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
              <li>Authentication and Sessions:</li>
              <div className="pDiv">
                <p>
                  To keep you signed in and ensure you don’t have to log in
                  repeatedly during your session.
                </p>
              </div>
              <li>Personalization:</li>
              <div className="pDiv">
                <p>
                  To store your preferred language, locale, and other
                  customization settings for a better user experience.
                </p>
              </div>

              <li>Performance and Analytics:</li>
              <div className="pDiv">
                <p>
                  To understand how you interact with our website, track user
                  behavior, and improve our content and functionality.
                </p>
              </div>

              <li>Campaign Tracking:</li>
              <div className="pDiv">
                <p>
                  To determine where visitors came from (e.g., advertising
                  campaigns or social media), so we can evaluate the
                  effectiveness of our marketing efforts.
                </p>
              </div>
            </ul>
          </div>
        </section>
      </section>

      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>8. Changes to This Privacy Policy</h2>
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
            If you have any questions about this Privacy Policy, please email us
            at
          </p>
          <p>
            {" "}
            <a href="mailto:support@bonfiire.fi" style={{ color: "green" }}>
              support@bonfiire.fi
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
