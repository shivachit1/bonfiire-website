import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/NavBar/navBar.js";
import Footer from "./components/Footer/Footer.js";
import TermsPage from "./components/Terms/TermsPage.js";
import HomePage from "./components/Home/HomePage.js";
import PrivacyPolicy from "./components/Privacy/PrivacyPage.js";
import DownloadPage from "./components/Download/Download.js";
import EventDetailsPage from "./components/EventPage/EventDetailsPage.js";
import UserProfilePage from "./components/UserProfile/UserProfile.js";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

function App() {
  return (
    <div className="App">
      <Router>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" exact element={<HomePage />} />

          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/download" element={<DownloadPage />} />

          {/* handles deep linking */}
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/userprofile/:userId" element={<UserProfilePage />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
