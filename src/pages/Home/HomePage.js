import { Link } from "react-router-dom";
import Hero from "../../layout/Hero";
import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import Chapter from "../../layout/Chapter";
import FeatureGrid from "../../layout/FeatureGrid";
import LogoStrip from "../../layout/LogoStrip";
import RouteMap from "../../layout/RouteMap";
import Testimonials from "../../layout/Testimonials";
import Faq from "../../layout/Faq";
import CallToAction from "../../layout/CallToAction";
import AppLinks from "../../components/AppLinks/AppLinks";
import { useContent } from "../../i18n";
import { image, visible } from "../../content/content";

// Home, top to bottom: the promise (hero) → an illustrated event route → who trusts us
// → what Bonfiire does
// → the kinds of events it supports → what people say → download → questions.
// All text lives in src/content/<language>/home.json and the list files next to it.
const HomePage = () => {
  const { hero, why, eventTypes, finale, route } = useContent("home");
  const partners = useContent("partners");
  const testimonials = useContent("testimonials");
  const faq = useContent("faq");

  const partnerItems = visible(partners.items);
  const testimonialItems = visible(testimonials.items);
  const faqItems = visible(faq.items);

  return (
    <>
      <Hero {...hero} image={image(hero.image)}>
        <AppLinks />
      </Hero>

      <Section>
        <Intro eyebrow={route.eyebrow} title={route.title} text={route.text}>
          <RouteMap {...route} />
        </Intro>
      </Section>

      {partnerItems.length > 0 && (
        <Section className="section--compact">
          <LogoStrip title={partners.title} items={partnerItems} />
        </Section>
      )}

      <Section>
        <Intro eyebrow={why.eyebrow} title={why.title} text={why.text}>
          <FeatureGrid items={why.features} variant="plain" />
          {why.link && (
            <p className="more-link">
              <Link className="text-link" to={why.link.to}>
                {why.link.label}
              </Link>
            </p>
          )}
        </Intro>
      </Section>

      <Section id="event-types">
        <Intro eyebrow={eventTypes.eyebrow} title={eventTypes.title} text={eventTypes.text} />
        {eventTypes.items.map((item, index) => (
          <Chapter
            key={item.title}
            {...item}
            image={image(item.image)}
          />
        ))}
      </Section>

      {testimonialItems.length > 0 && (
        <Section>
          <Intro eyebrow={testimonials.eyebrow} title={testimonials.title}>
            <Testimonials items={testimonialItems} />
          </Intro>
        </Section>
      )}

      <CallToAction title={finale.title} text={finale.text} />

      {faqItems.length > 0 && (
        <Section>
          <Intro eyebrow={faq.eyebrow} title={faq.title}>
            <Faq items={faqItems} />
          </Intro>
        </Section>
      )}
    </>
  );
};

export default HomePage;
