import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const ChatRoomPage = () => {
  const navigate = useNavigate();

  const handleDeepLinkFallback = useCallback(() => {
    const fallbackDelay = 1000;

    const fallbackTimer = setTimeout(() => {
      // Redirect to download if the app doesn't intercept the link
      navigate("/download", { isSharedLinked: true });
    }, fallbackDelay);

    return () => clearTimeout(fallbackTimer);
  }, [navigate]);

  useEffect(() => {
    handleDeepLinkFallback();
  }, [handleDeepLinkFallback]);

  return (
    <div className="chat-fallback-container">
      <div className="fallback-content">
        <div className="loading-spinner"></div>
        <h2>Entering Chat...</h2>
        <p>
          Hang tight! We're jumping you into the <strong>Bonfiire</strong>
          conversation.
        </p>

        <div className="fallback-hint">
          <p>Don't have the app yet? We'll take you to the store shortly.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;
