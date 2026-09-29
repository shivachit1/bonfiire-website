import "./index.css"; // Optional CSS for styling
import { downloadData } from "../../downloadData";
import { useContent } from "../../i18n";

const AppLinks = () => {
  const { appLinks } = useContent("ui");

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
              <span className="sub-label">{appLinks.downloadOn}</span>
              <span className="main-label">{platform.title}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default AppLinks;
