import { useState } from "react";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import Tabs from "../../layout/Tabs";
import Figure from "../../layout/Figure";
import { useContent } from "../../i18n";

// /character: the 3D character, with its moves to pick from.
// Text lives in src/content/<language>/character.json.
const CharacterPage = () => {
  const content = useContent("character");
  const [move, setMove] = useState(content.moves[0].id);

  return (
    <Section>
      <div className="character-stage">
        <div
          id={`panel-${move}`}
          role="tabpanel"
          aria-labelledby={`tab-${move}`}
        >
          <Figure move={move} label={content.label} />
        </div>

        <div className="character-controls">
          <Intro
            as="h1"
            layout="left"
            title={content.title}
            text={content.text}
          />
          <div className="character-actions">
            <Tabs
              tabs={content.moves}
              active={move}
              onChange={setMove}
              label={content.movesLabel}
            />
            <p className="character-hint">{content.hint}</p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CharacterPage;
