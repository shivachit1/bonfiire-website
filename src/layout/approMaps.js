import ParkEventMap from "./ParkEventMap";
import BarCrawlMap from "./BarCrawlMap";
import CityHopperMap from "./CityHopperMap";

// Which illustrated map each Appro in content/<language>/appro.json shows (its "map").
const approMaps = {
  park: ParkEventMap,
  barCrawl: BarCrawlMap,
  cityHopper: CityHopperMap,
};

export default approMaps;
