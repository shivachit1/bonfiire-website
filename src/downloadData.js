import { IoLogoAndroid, IoLogoApple } from "react-icons/io";
import { FaAppStoreIos } from "react-icons/fa";

import { Apple, Play } from "lucide-react";

export const androidData = {
  icon: <IoLogoAndroid className="icon" />,
  title: "Android",
  downloadLink: "https://play.google.com/store/apps/details?id=com.bonfiire",
};

export const iosData = {
  icon: <FaAppStoreIos className="icon" />,
  title: "iOS",
  downloadLink: "https://apps.apple.com/fi/app/bonfiire/id105ffgfgfgfgf3012308",
};

export const downloadData = {
  ios: {
    id: "ios",
    title: "App Store",
    downloadLink: "https://apps.apple.com/us/app/bonfiire/id6752911306",
    icon: <IoLogoApple size={28} fill="currentColor" />,
    accentColor: "white", // White for Apple
  },
  android: {
    id: "android",
    title: "Google Play",
    downloadLink: "https://play.google.com/store/apps/details?id=com.bonfiire",
    icon: <IoLogoAndroid size={28} fill="currentColor" />,
    accentColor: "#3DDC84",
  },
};
