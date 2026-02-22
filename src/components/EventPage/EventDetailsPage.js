import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const EventDetailsPage = () => {
  const navigate = useNavigate();

  const handleDeepLinkFallback = useCallback(() => {
    const fallbackDelay = 3000;

    const fallbackTimer = setTimeout(() => {
      navigate("/download", { replace: true });
    }, fallbackDelay);

    return () => clearTimeout(fallbackTimer);
  }, [navigate]);

  useEffect(() => {
    handleDeepLinkFallback();
  }, [handleDeepLinkFallback]);

  return (
    <div className="event-details-fallback-container">
      <div className="fallback-content">
        <div className="loading-spinner"></div>
        <h2>Opening Bonfiire...</h2>
        <p>We're looking for the app on your device.</p>
        <div className="fallback-hint">
          <p>Don't have the app yet? We'll take you to the store shortly.</p>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
