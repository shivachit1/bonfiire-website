import "./index.css";
import AppLinks from "../../components/AppLinks/AppLinks";
import { useEffect } from "react";
import { downloadData } from "../../downloadData";
import { useLocation } from "react-router-dom";
import DownloadQR from "./DownloadQR";
import { useContent } from "../../i18n";
import Intro from "../../layout/Intro";

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
  const { appLinks, download } = useContent("ui");

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

  return (
    <div className="download-page">
      <div className="download-content">
        <div className="download-text">
          <Intro
            as="h1"
            layout="left"
            title={download.title}
            text={[download.subtitle]}
          />
          <div className="download-links-wrapper">
            <AppLinks />
          </div>
        </div>
        <div className="download-or" aria-hidden="true">
          <span>{appLinks.or}</span>
        </div>
        <figure className="download-qr">
          <div className="download-qr-code">
            <DownloadQR value={downloadPageUrl()} size={200} />
          </div>
          <figcaption>{appLinks.scanToDownload}</figcaption>
        </figure>
      </div>
    </div>
  );
};

export default DownloadAppPage;
