import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Navbar from "./components/NavBar/navBar.js";
import Footer from "./components/Footer/Footer.js";
import PrivacyPage from "./components/Privacy/PrivacyPage.js";
import TermsPage from "./components/Terms/TermsPage.js";
import HomePage from "./components/Home/HomePage.js";
import PrivacyPolicy from "./components/Privacy/PrivacyPage.js";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsPage} />
        </Switch>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
