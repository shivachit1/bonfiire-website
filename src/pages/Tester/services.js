import "./index.css";
import testflightIcon from "./testflight.png";
import appIconImage from "./icon.png"; // Renamed for clarity
import ScreenImage from "./BonfiireHome.jpg"; // Renamed for clarity
import PlayStoreImage from "./play_store.png"; // Renamed for clarity
import GroupPic from "./group_pic.png"; // Renamed for clarity

// ... (imports remain the same)

export const iosDownloadSteps = [
  // Step 1: Get TestFlight (Same as yours)
  {
    id: 1,
    headerTitle: "Step 1",
    title: "Get TestFlight",
    icon: testflightIcon,
    description: (
      <p>
        Before you can install our <b>Bonfiire</b> beta, you'll need{" "}
        <strong>TestFlight</strong> app.
      </p>
    ),
    url: "https://testflight.apple.com/join/MdUs6Bbr",
    buttonText: "Download TestFlight",
  },

  {
    id: 2,
    headerTitle: "Step 2",
    title: "Create Test Flight Account",
    icon: testflightIcon,
    description: (
      <p>
        Create an account in <b>TestFlight.</b> It is only few clicks away.
      </p>
    ),
    url: "https://testflight.apple.com/join/MdUs6Bbr",
  },

  {
    id: 3,
    headerTitle: "Step 3",
    title: "Join the Beta",
    icon: appIconImage,
    description:
      "Open the link below to get access to our beta app in TestFlight.",
    url: "https://testflight.apple.com/join/MdUs6Bbr",
    buttonText: "Open Invitation Link",
  },

  {
    id: 4,
    headerTitle: "Step 4",
    title: "Install & Launch",
    icon: ScreenImage,
    description: (
      <p>
        In the TestFlight app, tap <b>'Install'</b>. You're all set! Open the
        app and start exploring."
      </p>
    ),
  },
];

export const androidDownloadSteps = [
  {
    id: 1,
    headerTitle: "Step 1",
    title: <h3>Open Play store app</h3>,
    icon: PlayStoreImage,
    description: (
      <p>
        Open your <b>Play store </b> app and check your <b>account </b> email
        address
      </p>
    ),
    url: "https://play.google.com/store/account",
    buttonText: "Open Play store",
  },
  {
    id: 2,
    headerTitle: "Step 2",
    title: "Join the Beta Group",
    icon: GroupPic,
    description: (
      <p>
        Sign in with your same <b>Play store </b>account and Join the{" "}
        <b>Bonfiire</b> beta group
      </p>
    ),
    url: "https://groups.google.com/a/bonfiire.io/g/bonfiire-testers",
    buttonText: "Join Beta Group",
  },
  {
    id: 3,
    headerTitle: "Step 3",
    title: "Open link",
    icon: appIconImage,
    description: (
      <p>
        Open the invitation link below, <br />
        It will open our download able page in Play store.
      </p>
    ),
    url: "https://play.google.com/store/apps/details?id=com.bonfiire",
    buttonText: "Open Invitation Link",
  },
  {
    id: 4,
    headerTitle: "Step 4",
    title: "Install & Launch",
    icon: ScreenImage,
    description: (
      <p>
        In the TestFlight app, tap <b>'Install'</b>. You're all set! Open the
        app and start exploring."
      </p>
    ),
  },
];
