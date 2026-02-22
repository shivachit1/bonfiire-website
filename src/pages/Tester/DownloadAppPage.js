import "./index.css";
import HighLightText from "../../components/HighLight/HighLightText";
import SectionHeader from "../../components/Header/Header";
import AppLinks from "../../components/AppLinks/AppLinks";
import { useEffect } from "react";
import { downloadData } from "../../downloadData";

const DownloadAppPage = () => {
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    let targetUrl = downloadData.ios.downloadLink; // Default fallback

    // Determine the correct store link
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      targetUrl = downloadData.ios.downloadLink;
    } else if (/android/i.test(userAgent)) {
      targetUrl = downloadData.android.downloadLink;
    }

    // Set the timer for 3000ms (3 seconds)
    const timer = setTimeout(() => {
      window.location.href = targetUrl;
    }, 3000);

    // Cleanup: if the user leaves the page before the timer hits, cancel it
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="download-page">
      <div className="download-content">
        <HighLightText text="Bonfiire for Mobile" />
        <SectionHeader
          title="Download {Bonfiire}"
          subtitle="Get your Bonfiire app on your device and start connecting with your community today."
        />
        <div className="download-links-wrapper">
          <AppLinks />
        </div>
      </div>
    </div>
  );
};

export default DownloadAppPage;
