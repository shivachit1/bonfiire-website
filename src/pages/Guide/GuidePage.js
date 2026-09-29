import { Link } from "react-router-dom";
import Hero from "../../layout/Hero";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import Chapter from "../../layout/Chapter";
import FeatureGrid from "../../layout/FeatureGrid";
import Faq from "../../layout/Faq";
import CallToAction from "../../layout/CallToAction";
import PhotoBreak from "../../layout/PhotoBreak";
import FeatureGroups from "../../layout/FeatureGroups";
import { useContent } from "../../i18n";
import { image, visible } from "../../content/content";

// Builds a page from a content file (e.g. src/content/en/features.json):
// a hero (with a photo) or a plain page header (without one), then each entry in
// `sections` by its "type", then the download call to action.
const sectionTypes = {
  chapters: (section) => (
    <>
      <Intro eyebrow={section.eyebrow} title={section.title} text={section.text} />
      {section.items.map((item, index) => (
        <Chapter
          key={item.title}
          {...item}
          number={section.numbered === false ? null : String(index + 1).padStart(2, "0")}
          image={image(item.image)}
          screenshot={image(item.screenshot)}
          reverse={index % 2 === 1}
        />
      ))}
    </>
  ),

  // Feature cards in labelled groups, with an optional link underneath.
  featureGroups: (section) => (
    <Intro eyebrow={section.eyebrow} title={section.title} text={section.text}>
      <FeatureGroups groups={section.groups} />
      {section.link && (
        <p className="more-link">
          <Link className="text-link" to={section.link.to}>
            {section.link.label}
          </Link>
        </p>
      )}
    </Intro>
  ),

  features: (section) => (
    <Intro eyebrow={section.eyebrow} title={section.title} text={section.text}>
      <FeatureGrid items={section.items} />
    </Intro>
  ),

  // Uses the shared questions in faq.json unless the section lists its own.
  faq: (section, faq) => {
    const items = visible(section.items || faq.items);
    if (items.length === 0) return null;
    return (
      <Intro eyebrow={section.eyebrow || faq.eyebrow} title={section.title || faq.title}>
        <Faq items={items} />
      </Intro>
    );
  },
};

// `page` is the content file name, e.g. "features" or "help-organizers".
const GuidePage = ({ page }) => {
  const { hero, sections, cta } = useContent(page);
  const faq = useContent("faq");

  const heroLink = hero.link && (
    <p className="hero-links">
      <Link className="text-link" to={hero.link.to}>
        {hero.link.label}
      </Link>
    </p>
  );

  return (
    <>
      {hero.image ? (
        <Hero {...hero} image={image(hero.image)}>
          {heroLink}
        </Hero>
      ) : (
        <Section className="page-header" width="narrow">
          <Intro eyebrow={hero.eyebrow} title={hero.title} text={[hero.text]} as="h1">
            {heroLink}
          </Intro>
        </Section>
      )}

      {sections.map((section, index) => {
        // A full-width photo with a quote; sits between sections, not inside one.
        if (section.type === "photo") {
          return <PhotoBreak key={index} {...section} image={image(section.image)} />;
        }
        const body = sectionTypes[section.type]?.(section, faq);
        return (
          body && (
            <Section key={index} width={section.width}>
              {body}
            </Section>
          )
        );
      })}

      <CallToAction title={cta.title} text={cta.text} />
    </>
  );
};

export default GuidePage;
