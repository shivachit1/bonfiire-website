import { useMemo } from "react";
import QRCode from "qrcode";
import IconPNG from "../../components/NavBar/icon.png";

// A QR code drawn in the brand style: round brown dots, rounded corner
// markers with an orange center, and the app icon in the middle. Error
// correction "H" lets up to 30% of the code be covered, so the icon fits.
const FINDER = 7; // corner markers are 7x7 modules
const LOGO_ZONE = 9; // modules cleared in the middle for the icon
const ICON_RATIO = 1280 / 1807; // icon.png width / height

const DownloadQR = ({ value, size = 200 }) => {
  const { count, dots, finders, logo } = useMemo(() => {
    const { modules } = QRCode.create(value, { errorCorrectionLevel: "H" });
    const n = modules.size;

    const finders = [
      [0, 0],
      [n - FINDER, 0],
      [0, n - FINDER],
    ];
    const inFinder = (x, y) =>
      finders.some(
        ([fx, fy]) => x >= fx && x < fx + FINDER && y >= fy && y < fy + FINDER
      );

    const start = (n - LOGO_ZONE) / 2;
    const inLogo = (x, y) =>
      x >= start && x < start + LOGO_ZONE && y >= start && y < start + LOGO_ZONE;

    const dots = [];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (modules.get(x, y) && !inFinder(x, y) && !inLogo(x, y)) {
          dots.push([x, y]);
        }
      }
    }

    const height = LOGO_ZONE - 2;
    const width = height * ICON_RATIO;
    const logo = { x: (n - width) / 2, y: (n - height) / 2, width, height };

    return { count: n, dots, finders, logo };
  }, [value]);

  return (
    <svg
      className="download-qr-svg"
      viewBox={`0 0 ${count} ${count}`}
      width={size}
      height={size}
      role="img"
      aria-label={value}
    >
      <g className="download-qr-dots">
        {dots.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={0.42} />
        ))}
      </g>
      {finders.map(([x, y]) => (
        <g key={`${x}-${y}`} className="download-qr-finder">
          <rect
            className="download-qr-finder-ring"
            x={x + 0.5}
            y={y + 0.5}
            width={FINDER - 1}
            height={FINDER - 1}
            rx={1.8}
          />
          <rect
            className="download-qr-finder-eye"
            x={x + 2}
            y={y + 2}
            width={3}
            height={3}
            rx={1}
          />
        </g>
      ))}
      <image href={IconPNG} {...logo} />
    </svg>
  );
};

export default DownloadQR;
