import Section from "../../layout/Section";
import Intro from "../../layout/Intro";
import Faq from "../../layout/Faq";
import { useContent } from "../../i18n";
import { visible } from "../../content/content";

// /faq: the frequently asked questions (src/content/en/faq.json), opened from
// the navbar. They were on the home page's last band before (removed 2026-10-31).
const FaqPage = () => {
  const faq = useContent("faq");
  return (
    <div className="sections--light-first">
      <Section className="section--cream">
        <Intro layout="left" as="h1" size="page" title={faq.title}>
          <Faq items={visible(faq.items)} />
        </Intro>
      </Section>
    </div>
  );
};

export default FaqPage;
