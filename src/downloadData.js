import { IoLogoApple } from "react-icons/io";
import { FaGooglePlay } from "react-icons/fa";

export const downloadData = {
  ios: {
    id: "ios",
    title: "App Store",
    downloadLink: "https://apps.apple.com/fi/app/bonfiire/id6752911306",
    icon: <IoLogoApple className="icon_style" size={34} fill="currentColor" />,
    accentColor: "white", // White for Apple
  },
  android: {
    id: "android",
    title: "Google Play",
    downloadLink: "https://play.google.com/store/apps/details?id=com.bonfiire",
    icon: <FaGooglePlay className="icon_style" size={24} fill="currentColor" />,
    accentColor: "orange",
  },
};
