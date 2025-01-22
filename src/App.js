import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/NavBar/navBar.js";
import Footer from "./components/Footer/Footer.js";
import TermsPage from "./components/Terms/TermsPage.js";
import HomePage from "./components/Home/HomePage.js";
import PrivacyPolicy from "./components/Privacy/PrivacyPage.js";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" exact element={<HomePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
