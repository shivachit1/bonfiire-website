import "./index.css"; // Optional CSS for styling
import { Link } from "react-router-dom";
import { downloadData } from "../../downloadData";

const AppLinks = () => {
  return (
    <section>
      <div className="appLinks-list">
        {Object.values(downloadData).map((platform) => (
          <a
            key={platform.id}
            href={platform.downloadLink}
            className={`download-card ${platform.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ "--accent": platform.accentColor }}
          >
            <div className="icon-wrapper">{platform.icon}</div>
            <div className="label-wrapper">
              <span className="sub-label">Download on</span>
              <span className="main-label">{platform.title}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export const DownLoadLink = () => {
  return (
    <Link to={"/download"} className="button">
      Get app
    </Link>
  );
};

export default AppLinks;
