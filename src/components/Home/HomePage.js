import React from "react";
import "./index.css";

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

      <div className="appLinks">
        <h1 style={{ color: "#27AE60" }}>Stay tuned.....</h1>
        <p>
          Our app will soon be available for download on both Android and iOS
          devices. Keep checking back for the latest updates and links!
        </p>
      </div>
    </div>
  );
};

export default HomePage;
