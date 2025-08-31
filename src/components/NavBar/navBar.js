import "./index.css";
import IconPNG from "./icon.png";
import { Button } from "../Button/Button";
import { FaDownload } from "react-icons/fa";

const Navbar = () => {
  const scrollToElement = () => {
    const element = document.getElementById("footer");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="navDiv">
      <nav>
        <div>
          <a href="/" className="logo">
            <img className="icon_image" src={IconPNG} alt="icon" />
            <h2>Bonfiire</h2>
          </a>
        </div>
        <div>
          <Button text="Get the App" onPress={scrollToElement}>
            <FaDownload
              style={{
                backgroundColor: "transparent",
                color: "white",
                fontSize: "1rem",
              }}
            />
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
