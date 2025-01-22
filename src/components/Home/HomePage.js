import React from "react";
import "./index.css";
import AppLinks from "../AppLinks/AppLinks";

const HomePage = () => {
  return (
    <div className="homeSection">
      <section>
        <h2 style={{ marginTop: "30px" }}>Bonfiire</h2>
        <div className="pDiv">
          <p>
            Whether it’s a festival, conference, student event, or personal
            celebration, Bonfiire makes planning effortless. With real-time
            updates, easy ticketing, and user-friendly tools, creating
            unforgettable events has never been simpler. Let’s turn your
            gatherings into something extraordinary!
          </p>
        </div>
      </section>

      <AppLinks />
    </div>
  );
};

export default HomePage;
