import React, { useEffect } from "react";
import "./index.css";
import AppLinks from "../AppLinks/AppLinks";
import { androidData, iosData } from "../../downloadData";

const DownloadPage = () => {

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      window.location.href = iosData.downloadLink;
    } else if (/android/i.test(userAgent)) {
      window.location.href = androidData.downloadLink;
    }
  }, []);

  return (
    <div className="downloadSection">
      <section>
        <h1 style={{ color: "#27AE60" }}>Redirecting.....</h1>
        <div className="pDiv">
          <p>If you are not redirected, click the appropriate link below:</p>
        </div>
      </section>
      <AppLinks />
    </div>
  );
};

export default DownloadPage;
