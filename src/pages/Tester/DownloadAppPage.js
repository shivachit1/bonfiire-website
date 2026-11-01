import "./index.css";
import { useEffect } from "react";
import { downloadData } from "../../downloadData";
import { useLocation } from "react-router-dom";
import DownloadQR from "./DownloadQR";
import { useContent } from "../../i18n";
import Intro from "../../layout/Intro";
import Heading from "../../layout/Heading";

// The QR points at this site's /download page; on localhost a phone can't
// reach the dev server, so fall back to the live site there.
const downloadPageUrl = () => {
  const { hostname, origin } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  return `${isLocal ? "https://bonfiire.io" : origin}/download`;
};

const DownloadAppPage = () => {
  const { state } = useLocation();
  const isSharedLinked = state?.isSharedLinked;
  const { download } = useContent("ui");

  const waitingTime = isSharedLinked ? 1000 : 0;

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS =
      (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) ||
      // iPadOS 13+ reports itself as a Mac; tell it apart by touch support
      (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(userAgent);

    // Desktop: stay on the page and show both store links
    if (!isIOS && !isAndroid) return;

    const targetUrl = isIOS
      ? downloadData.ios.downloadLink
      : downloadData.android.downloadLink;

    // Set the timer for 3000ms (3 seconds)
    const timer = setTimeout(() => {
      window.location.href = targetUrl;
    }, waitingTime);

    // Cleanup: if the user leaves the page before the timer hits, cancel it
    return () => clearTimeout(timer);
  }, [waitingTime]);

  // One column in the middle, all centred: "Scan to download" (the page's
  // heading) as a handwritten note with an arrow down to the QR code, the
  // QR code (on phones too) framed by a camera's four curved corners in the
  // highlight orange; then where it's available.
  return (
    <div className="download-page">
      <div className="download-content">
        {/* "Scan to download" as a handwritten note, a hand-drawn arrow
            curving from it down to the QR code */}
        <div className="download-note">
          <Heading as="h1" size="section" className="download-heading">
            {download.heading}
          </Heading>
          <svg
            className="download-arrow"
            viewBox="0 0 70 80"
            aria-hidden="true"
          >
            <path d="M 6 10 C 44 2, 58.0 34.0, 31.6 64.1" pathLength="1" />
            <path
              className="download-arrow-head"
              d="M 45.0 66.8 L 33.2 66.2 Q 30.0 66.0 29.4 62.9 L 27.2 51.3"
              pathLength="1"
            />
          </svg>
        </div>
        <figure className="download-qr">
          <div className="download-qr-card">
            {["tl", "tr", "br", "bl"].map((corner) => (
              <svg
                key={corner}
                className={`download-qr-corner download-qr-corner--${corner}`}
                viewBox="0 0 36 36"
                aria-hidden="true"
              >
                <path d="M 4 32 V 20 A 16 16 0 0 1 20 4 H 32" />
              </svg>
            ))}
            <div className="download-qr-code">
              <DownloadQR value={downloadPageUrl()} size={200} />
            </div>
          </div>
        </figure>
        <div className="download-text">
          <Intro title={download.title} />
        </div>
      </div>
    </div>
  );
};

export default DownloadAppPage;
