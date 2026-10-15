import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import World3D from "../../layout/World3D";
import { useContent } from "../../i18n";

// /map3d: every Appro route in one 3D world. Text lives in
// src/content/<language>/world.json; the routes' names and checkpoints come from appro.json.
const WorldMapPage = () => {
  const content = useContent("world");
  const appro = useContent("appro");

  const districts = content.districts.map((id) => {
    const event = appro.events[id];
    const games = Object.values(event.labels.games);
    const names = event.labels.bars || event.labels.places || games;
    return {
      id,
      name: event.cardTitle,
      summary: event.summary,
      slug: event.slug,
      checkpoints: games.map((game, i) => ({ name: names[i] ?? game, game })),
    };
  });

  return (
    <Section>
      <Intro as="h1" layout="left" title={content.title} text={content.text} />
      <World3D districts={districts} text={content} />
    </Section>
  );
};

export default WorldMapPage;
