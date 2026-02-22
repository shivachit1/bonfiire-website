import "./index.css";
import HighLightText from "../../components/HighLight/HighLightText";
import SectionHeader from "../../components/Header/Header";
import AppLinks from "../../components/AppLinks/AppLinks";

const DownloadAppPage = () => {
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
