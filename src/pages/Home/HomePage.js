import "./index.css";
import GatheringImage from "./Picture1.webp";
import ServiceCards from "../../components/Services/Service";
import StepByStep from "../../components/StepByStep/StepByStep";
import WhyJoinSection from "../../components/WhyUs/WhyUs";
import SectionHeader from "../../components/Header/Header";
import HomeSection from "../../components/HeroSection/HeroSection";
import HighLightText from "../../components/HighLight/HighLightText";
import AppLinks from "../../components/AppLinks/AppLinks";
import ContactSupport from "../../components/ContactForm/contact";

const HomePage = () => {
  return (
    <div className="hp-container">
      <HomeSection imageUrl={GatheringImage} />

      {/* Background spans 100%, content stays in 1440px */}
      <article className="hp-article-wrapper hp-bg-white">
        <section className="hp-content-limit">
          <HighLightText text="Core Features" />
          <SectionHeader
            title="How {Bonfiire} Works"
            subtitle="We make it easy to turn online connections into real-world friendships."
          />
          <ServiceCards />
        </section>
        <StepByStep />
      </article>

      <WhyJoinSection />

      <article className="hp-article-wrapper hp-bg-white">
        <section className="hp-content-limit">
          <SectionHeader
            title="Get your {Bonfiire}"
            subtitle="Download the app now and start discovering events and connect with people."
          />
          <AppLinks />
        </section>
      </article>

      <article className="hp-article-wrapper">
        <section className="hp-content-limit">
          <ContactSupport
            title="Trouble with {Bonfiire}?"
            subtitle="Reach out to our support team directly. We'll quickly resolve any issues you may have."
          />
        </section>
      </article>
    </div>
  );
};

export default HomePage;
