import { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/NavBar/navBar.js";
import Footer from "./components/Footer/Footer.js";
import TermsPage from "./components/Terms/TermsPage.js";
import HomePage from "./pages/Home/HomePage.js";
import GuidePage from "./pages/Guide/GuidePage.js";
import HelpCenterPage from "./pages/Help/HelpCenterPage.js";
import { LanguageProvider } from "./i18n";
import PrivacyPolicy from "./components/Privacy/PrivacyPage.js";
import EventDetailsPage from "./components/EventPage/EventDetailsPage.js";
import UserProfilePage from "./components/UserProfile/UserProfile.js";
import DownloadAppPage from "./pages/Tester/DownloadAppPage.js";
import ChatRoomPage from "./components/ChatRoom/ChatRoom.js";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    // Links like /features#multiple-checkpoints jump to that part of the page.
    // A new page starts at the top; changes within a page (e.g. switching help tabs) don't scroll.
    const target = hash && document.getElementById(hash.slice(1));
    if (target) {
      target.scrollIntoView();
    } else if (previousPath.current !== pathname) {
      window.scrollTo(0, 0);
    }
    previousPath.current = pathname;
  }, [pathname, hash]);

  return null;
};

function App() {
  return (
    <LanguageProvider>
      <div className="app-main-layout">
        <Router>
          <ScrollToTop />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" exact element={<HomePage />} />
              <Route
                path="/features"
                element={<GuidePage key="features" page="features" />}
              />
              <Route path="/help" element={<HelpCenterPage />} />
              {/* Old per-role help pages now open the matching help center tab. */}
              {[
                ["participants", "attending"],
                ["organizers", "organizing"],
                ["co-hosts", "organizing"],
                ["checkpoint-hosts", "organizing"],
              ].map(([role, tab]) => (
                <Route
                  key={role}
                  path={`/help/${role}`}
                  element={<Navigate to={`/help?tab=${tab}`} replace />}
                />
              ))}

              {/* Old "How it works" links */}
              <Route
                path="/how-it-works"
                element={<Navigate to="/features" replace />}
              />
              <Route
                path="/how-it-works/students"
                element={<Navigate to="/help?tab=attending" replace />}
              />
              <Route
                path="/how-it-works/organizers"
                element={<Navigate to="/features" replace />}
              />

              <Route path="/download" element={<DownloadAppPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              {/* handles deep linking */}
              <Route path="/events/:eventId" element={<EventDetailsPage />} />
              <Route
                path="/userprofile/:userId"
                element={<UserProfilePage />}
              />
              <Route path="/messages/:chatRoomId" element={<ChatRoomPage />} />
              <Route
                path="/events/:eventId/invitations/:invitationId/e-ticket"
                element={<EventDetailsPage />}
              />
              <Route
                path="/events/:eventId/locations/:locationId/self-check-in"
                element={<EventDetailsPage />}
              />
            </Routes>
          </main>
          <Footer />
        </Router>
      </div>
    </LanguageProvider>
  );
}

export default App;
