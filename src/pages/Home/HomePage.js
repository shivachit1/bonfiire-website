import "./index.css";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { Button } from "../../components/Button/Button";
import { ReactComponent as GroupSVG } from "./svgImage.svg";
import mobileImage from "./mobile.png";
import { servicesData } from "./services";
import { Link } from "react-router-dom";
import { featuresData } from "./features";

const HomePage = () => {
  return (
    <div className="homeContainer">
      <section className="homeSection">
        <GroupSVG className="svg-icon" />
        <div className="headerInfo">
          <div className="highlight">
            <p className="hightlight_text">Connecting Communities</p>
          </div>
          <h1 style={{ marginTop: "10px" }}>Spark Real Connections</h1>
          <div className="centerDiv">
            <p>
              Discover local events, activities, and meet-ups designed to bring
              people together and create meaningful experiences.
            </p>
          </div>
        </div>

        <div id="storeDiv" className="storeDiv">
          <Button text="App Store">
            <FaApple
              style={{
                backgroundColor: "transparent",
                color: "white",
                fontSize: "1rem",
              }}
            />
          </Button>
          <Button text="Play Store">
            <FaGooglePlay
              color="white"
              style={{
                backgroundColor: "transparent",
                color: "white",
                fontSize: "1rem",
              }}
            />
          </Button>
        </div>
      </section>

      <article className="servicesArticle">
        <section className="servicesSection">
          <div className="highlight">
            <p className="hightlight_text">Core Features</p>
          </div>
          <h2 style={{ marginTop: "10px" }}>Everything You Need to Connect</h2>
          <div className="centerDiv">
            <p>
              Our platform makes it easy to discover, join, and create
              meaningful social experiences with people who share your
              interests.
            </p>
          </div>
          <section className="services-list">
            {servicesData.map((service) => {
              return (
                <div key={service.title} className="service-card">
                  {service.icon}
                  <h3 style={{ marginTop: "16px" }}>{service.title}</h3>
                  <p>{service.description}</p>
                  <Link className="link" to="/">
                    See More
                  </Link>
                </div>
              );
            })}
          </section>
        </section>
      </article>

      <article className="appArticle">
        <div className="imageContainer">
          <img className="image" src={mobileImage} alt="mobile" />
        </div>
        <section className="appSection">
          <div className="highlight">
            <p className="hightlight_text">Mobile Experience</p>
          </div>
          <h2 style={{ marginTop: "10px", alignItems: "flex-start" }}>
            Take Bonfiire With You Everywhere
          </h2>
          <div>
            <p>
              Our mobile app puts the power of connection in your pocket.
              Discover events, message friends, and get notifications in
              real-time, wherever you are.
            </p>
          </div>
          <section className="features-list">
            {featuresData.map((feature) => {
              return (
                <div key={feature.id} className="feature-card">
                  <div className="numberStyle">
                    <p>{feature.id}</p>
                  </div>

                  <div className="featureInfo">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </section>
        </section>
      </article>

      <article className="servicesArticle">
        <section className="servicesSection">
          <h2 style={{ marginTop: "10px" }}>
            Ready to Spark Real Connections?
          </h2>
          <div className="centerDiv">
            <p>
              Download the Bonfiire app now and start discovering events and
              people in your area. Your next great connection is just a tap
              away.
            </p>
          </div>
          <div className="storeDiv">
            <Button text="App Store">
              <FaApple
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              />
            </Button>
            <Button text="Play Store">
              <FaGooglePlay
                color="white"
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              />
            </Button>
          </div>
        </section>
      </article>
    </div>
  );
};

export default HomePage;
