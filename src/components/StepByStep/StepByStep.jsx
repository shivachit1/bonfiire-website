import "./index.css";

const StepByStep = () => {
  const steps = [
    {
      number: 1,
      title: "Browse & Discover",
      description: "Explore events and activities near you",
      colorClass: "step-orange",
    },
    {
      number: 2,
      title: "Join & Connect",
      description: "RSVP to events and meet new people",
      colorClass: "step-yellow",
    },
    {
      number: 3,
      title: "Build Community",
      description: "Create lasting friendships and memories",
      colorClass: "step-orange",
    },
  ];

  return (
    <div className="steps-outer-wrapper">
      <div className="steps-inner-container">
        {steps.map((step) => (
          <div key={step.number} className="step-card-centered">
            <div className={`step-number-circle ${step.colorClass}`}>
              {step.number}
            </div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepByStep;
