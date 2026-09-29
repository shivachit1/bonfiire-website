import "./layout.css";
import Chapter from "./Chapter";
import { image } from "../content/content";

// Screenshot placeholders only show while developing (npm start), never live.
const showPlaceholders = process.env.NODE_ENV === "development";

// The steps of a help topic. steps: [{ title, text, screenshot?, video?, screenshotHint? }]
// With screenshots, each step is a row with the phone on one side and the words on
// the other, zig-zagging down the page. Until a topic has any screenshot or video,
// the live site shows a plain numbered list instead, so nothing looks empty.
const HelpSteps = ({ steps, stepLabel }) => {
  const hasMedia = showPlaceholders || steps.some((step) => step.screenshot || step.video);

  if (!hasMedia) {
    return (
      <ol className="help-steps">
        {steps.map((step, index) => (
          <li key={step.title} className="help-step">
            <span className="help-step-number">{index + 1}</span>
            <div>
              <p className="help-step-title">{step.title}</p>
              <p className="help-step-text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="help-stories">
      {steps.map((step, index) => (
        <Chapter
          key={step.title}
          label={`${stepLabel} ${index + 1}`}
          title={step.title}
          text={[step.text]}
          screenshot={image(step.screenshot)}
          video={image(step.video)}
          screenshotHint={step.screenshotHint}
          imageAlt={step.title}
          reverse={index % 2 === 1}
        />
      ))}
    </div>
  );
};

export default HelpSteps;
