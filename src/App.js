import React from "react";
import Navbar from "./components/NavBar/navBar.js";
import Footer from "./components/Footer/Footer.js";
import { CompanyInfo } from "./components/HeroSection/CompanyInfo.js";
import MyServices from "./components/Services/Services.js";
import Contact from "./components/ContactForm/contact.js";

function App() {
  return (
    <div className="App">
      <Navbar />
      <CompanyInfo />
      <MyServices />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
