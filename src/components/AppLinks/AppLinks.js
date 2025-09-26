import "./index.css"; // Optional CSS for styling
import { Link } from "react-router-dom";
import { androidData, iosData } from "../../downloadData";

const AppLinks = () => {
  return (
    <div id="services" className="appLinks">
      <div className="appLinks-list">
        <Link className="appLinks-card" to={androidData.downloadLink}>
          {androidData.icon}
          <h4>{androidData.title}</h4>
        </Link>
        <Link className="appLinks-card" to={iosData.downloadLink}>
          {iosData.icon}
          <h4>{iosData.title}</h4>
        </Link>
      </div>
    </div>
  );
};

export const DownLoadLink = () => {
  return (
    <Link to={"/download"} className="button">
      Installation Guide
    </Link>
  );
};

export default AppLinks;
