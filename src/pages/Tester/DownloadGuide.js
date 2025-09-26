// DownloadAppGuide.jsx
import React from "react";
import { FaApple, FaGooglePlay } from "react-icons/fa";
// Assuming Button and the following files are correctly imported from their paths
import { Button } from "../../components/Button/Button";
import { androidDownloadSteps, iosDownloadSteps } from "./services";
// Note: featuresData is not used in the provided JSX, so it's omitted here.
import StepCard from "./StepCard";
import "./index.css";
import HighLightText from "../../components/HighLight/HighLightText";
import HeroHeader from "../../components/HeroSection/HeroHeader";
import SectionHeader from "../../components/Header/Header";
import ContactSupport from "../../components/ContactForm/contact";

const DownloadAppGuide = () => {
  return (
    <div className="download-guide-container">
      <section className="servicesSection">
        <HighLightText text="Installation guide" />
        <SectionHeader
          title="Download {Bonfiire}"
          subtitle="Get your Bonfiire app on your device and start connecting with your
              community today."
        />
      </section>

      {/* iOS Guide Section */}
      <article className="servicesArticle">
        <section className="servicesSection">
          <HighLightText text="Early iOS Adopters" />
          <SectionHeader
            title="{iPhone / iPad} Users"
            subtitle={
              <p>
                Install the <b>Bonfiire</b> iOS beta instantly via Apple{" "}
                <b>TestFlight</b> and start testing today.
              </p>
            }
          />

          <section className="download-steps-container">
            {iosDownloadSteps.map((item) => (
              <StepCard key={item.id} item={item} />
            ))}
          </section>
        </section>
      </article>

      {/* Android Guide Section */}
      <article className="servicesArticle">
        <section className="servicesSection">
          <HighLightText text="Early Android Adopters" />
          <SectionHeader
            title="{Android}  Users"
            subtitle={
              <p>
                Install the <b>Bonfiire</b> beta instantly via <b>Play Store</b>{" "}
                and start using today.
              </p>
            }
          />

          <section className="download-steps-container">
            {androidDownloadSteps.map((item) => (
              <StepCard key={item.id} item={item} />
            ))}
          </section>
        </section>
      </article>

      <article className="servicesArticle">
        <section className="servicesSection">
          <ContactSupport
            title="Trouble setting up {Bonfiire}?"
            subtitle="Reach out to our support team directly. We'll quickly resolve any download or installation problems."
          />
        </section>
      </article>
    </div>
  );
};

export default DownloadAppGuide;
