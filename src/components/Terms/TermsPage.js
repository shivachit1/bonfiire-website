import React from "react";
import "./index.css";

const TermsPage = () => {
  return (
    <div className="termsContainer">
      <header>
        <h1 style={{ textAlign: "left", marginTop: "30px" }}>
          Terms and Conditions
        </h1>
        <i>Effective Date: 2025-01-22</i>
      </header>

      <section>
        <h2 style={{ marginTop: "30px" }}>1. Introduction</h2>
        <div className="pDiv">
          <p>
            Welcome to Bonfiire! These Terms and Conditions ("Terms") govern
            your access to and use of Bonfiire's website and services
            ("Services"). By using our Services, you agree to comply with these
            Terms. Please read them carefully.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          2. Acceptance of Terms
        </h2>
        <div className="pDiv">
          <p>
            By accessing or using our Services, you agree to comply with and be
            bound by these Terms. If you do not agree to these Terms, please do
            not use our Services.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          3. User Registration
        </h2>
        <div className="pDiv">
          <p>
            To use certain features of our Services, you may be required to
            create an account. When registering, you agree to provide accurate,
            current, and complete information about yourself, and to update your
            information to keep it accurate. You are responsible for maintaining
            the confidentiality of your account credentials and for all
            activities that occur under your account.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          4. Use of Services
        </h2>
        <div className="pDiv">
          <p>
            You agree to use our Services in compliance with all applicable laws
            and regulations. You may not use our Services for any unlawful
            purpose or engage in any activity that could damage, disable,
            overburden, or impair our Services.
          </p>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "20px" }}>
        <h2>5. User Responsibilities</h2>
        <article className="pDiv">
          <p>As a user of the Bonfiire platform, you agree not to:</p>
        </article>
        <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
          <li>
            <p>Use the platform for any illegal activities.</p>
          </li>
          <li>
            <p>
              Post or transmit content that is offensive, harmful, or violates
              others' rights.
            </p>
          </li>
          <li>
            <p>
              Attempt to interfere with or disrupt the proper functioning of our
              Services.
            </p>
          </li>
          <li>
            <p>Engage in any form of hacking or fraudulent activity.</p>
          </li>
        </ul>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          6. Privacy and Data Collection
        </h2>
        <div className="pDiv">
          <p>
            Your use of our Services is governed by our Privacy Policy, which
            outlines how we collect, use, and safeguard your personal
            information. By using the Services, you consent to the practices
            described in our Privacy Policy.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          7. Payment and Fees
        </h2>
        <div className="pDiv">
          <p>
            Currently, our platform does not handle any financial transactions.
            However, in the future, we may offer paid services or in-app
            purchases. All such transactions will be processed by third-party
            payment processors, and we will update our Terms and Conditions
            accordingly.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          8. Third-Party Links and Services
        </h2>
        <div className="pDiv">
          <p>
            Our Services may contain links to third-party websites or services
            that are not owned or controlled by Bonfiire. We do not endorse or
            take responsibility for the content or practices of these
            third-party sites. You access them at your own risk.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          9. Termination of Account
        </h2>
        <div className="pDiv">
          <p>
            We reserve the right to suspend or terminate your account and access
            to the Services at our discretion, without notice, if you violate
            these Terms or engage in any activities harmful to the platform or
            other users.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          10. Intellectual Property
        </h2>
        <div className="pDiv">
          <p>
            The content, features, and functionality of the Bonfiire platform
            are owned by us and protected by intellectual property laws. You may
            not copy, modify, distribute, or create derivative works based on
            our content without prior written consent.
          </p>
        </div>
      </section>

      <section style={{ textAlign: "left", marginTop: "20px" }}>
        <h2>11. Disclaimers and Limitations of Liability</h2>
        <ul style={{ paddingLeft: "40px", marginTop: "10px" }}>
          <li>
            <p>
              No Warranty: Our Services are provided "as is" without any
              warranty of any kind, express or implied.
            </p>
          </li>
          <li>
            <p>
              Limitation of Liability: Bonfiire will not be liable for any
              indirect, incidental, special, or consequential damages arising
              from your use or inability to use the Services.
            </p>
          </li>
        </ul>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          12. Indemnification
        </h2>
        <div className="pDiv">
          <p>
            You agree to indemnify and hold Bonfiire, its officers, employees,
            and agents harmless from any claims, damages, liabilities, costs,
            and expenses arising from your use of the Services, your violation
            of these Terms, or any infringement of any intellectual property or
            other rights.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          13. Governing Law
        </h2>
        <div className="pDiv">
          <p>
            These Terms will be governed by and construed in accordance with the
            laws of the jurisdiction in which Bonfiire operates. Any disputes
            arising from these Terms will be resolved in the appropriate courts
            of that jurisdiction.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ textAlign: "left", marginTop: "30px" }}>
          14. Modifications
        </h2>
        <div className="pDiv">
          <p>
            Bonfiire reserves the right to modify, suspend, or terminate any
            part of the Services at any time, for any reason, without notice. We
            may also update or amend these Terms at any time. Any changes will
            be effective once posted on this page.
          </p>
        </div>
      </section>
      <section style={{ textAlign: "left", marginTop: "30px" }}>
        <h2>Contact Us</h2>
        <div className="pDiv">
          <p>
            If you have any questions or concerns regarding these Terms and
            Conditions, please contact us at:
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

export default TermsPage;
