import "./index.css";
import GatheringImage from "./gathering.png";
import ServiceCards from "../../components/Services/Service";
import StepByStep from "../../components/StepByStep/StepByStep";
import WhyJoinSection from "../../components/WhyUs/WhyUs";
import SectionHeader from "../../components/Header/Header";
import HomeSection from "../../components/HeroSection/HeroSection";
import HighLightText from "../../components/HighLight/HighLightText";
import { DownLoadLink } from "../../components/AppLinks/AppLinks";
import ContactSupport from "../../components/ContactForm/contact";

const HomePage = () => {
  return (
    <div className="homeContainer">
      <HomeSection imageUrl={GatheringImage} />

      <article className="servicesArticle">
        <section className="servicesSection">
          <HighLightText text="Core Features" />
          <SectionHeader
            title="How {Bonfiire} Works"
            subtitle="We make it easy to turn online connections into real-world
              friendships. Here's how we're changing the way people meet and
              connect."
          />
          <ServiceCards />
        </section>
        <StepByStep />
      </article>

      <WhyJoinSection />

      <article className="servicesArticle">
        <section className="servicesSection">
          <SectionHeader
            title="Get your {Bonfiire}"
            subtitle=" Download the Bonfiire app now and start discovering events and
              people in your area. Your next great connection is just a tap
              away."
          />
          <DownLoadLink />
        </section>
      </article>

      <article className="servicesArticle">
        <section className="servicesSection">
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
