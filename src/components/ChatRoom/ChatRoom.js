import { useNavigate } from "react-router-dom";
import "./index.css";
import { useCallback, useEffect } from "react";

const ChatRoomPage = () => {
  const navigate = useNavigate();

  const handleDeepLinkFallback = useCallback(() => {
    // We rely ONLY on the automatic Universal/App Link interception by the OS.

    // Schedule the fallback redirect (the delayed check).
    const fallbackDelay = 1500; // 1.5 seconds delay

    const fallbackTimer = setTimeout(() => {
      console.log(
        `Universal Link failed to open app after ${fallbackDelay}ms. Redirecting to /download.`
      );
      // Redirect to the download page, replacing the current history entry.
      navigate("/download", { replace: true });
    }, fallbackDelay);

    // Cleanup the timer on unmount/path change.
    return () => clearTimeout(fallbackTimer);
  }, [navigate]);

  useEffect(() => {
    handleDeepLinkFallback();
  }, [handleDeepLinkFallback]);

  return (
    <div className="userProfileSection">
      <section>
        <h2 style={{ marginTop: "30px" }}>Chat room</h2>
        <div className="pDiv">
          <p>Opening Bonfiire app in mobile or redirecting to download link</p>
        </div>
      </section>
    </div>
  );
};

export default ChatRoomPage;
