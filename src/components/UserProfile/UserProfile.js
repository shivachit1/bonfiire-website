import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css"; // Reuse or clone the Event fallback CSS

const UserProfilePage = () => {
  const navigate = useNavigate();

  const handleDeepLinkFallback = useCallback(() => {
    const fallbackDelay = 1000;

    const fallbackTimer = setTimeout(() => {
      navigate("/download", { isSharedLinked: true });
    }, fallbackDelay);

    return () => clearTimeout(fallbackTimer);
  }, [navigate]);

  useEffect(() => {
    handleDeepLinkFallback();
  }, [handleDeepLinkFallback]);

  return (
    <div className="profile-fallback-container">
      <div className="fallback-content">
        <div className="loading-spinner"></div>
        <h2>Finding Profile...</h2>
        <p>
          One second while we open the <strong>Bonfiire</strong> app.
        </p>

        <div className="fallback-hint">
          <p>Don't have the app yet? We'll take you to the store shortly.</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
