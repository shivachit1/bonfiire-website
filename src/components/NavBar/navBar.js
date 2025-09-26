import "./index.css";
import IconPNG from "./icon.png";
import { DownLoadLink } from "../AppLinks/AppLinks";

const Navbar = () => {
  return (
    <div className="navDiv">
      <nav>
        <div>
          <a href="/" className="logo">
            <img className="icon_image" src={IconPNG} alt="icon" />
            <h3 style={{ marginLeft: 8 }}>Bonfiire.io</h3>
          </a>
        </div>
        <div><DownLoadLink/></div>
      </nav>
    </div>
  );
};

export default Navbar;
