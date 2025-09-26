import "./index.css"; // Don't forget to create this CSS file

const StepByStep = () => {
  const steps = [
    {
      number: 1,
      title: "Browse & Discover",
      description: "Explore events and activities near you",
      gradientStart: "#e56822", // Orange for step 1
      gradientEnd: "#FFA05A",
    },
    {
      number: 2,
      title: "Join & Connect",
      description: "RSVP to events and meet new people",
      gradientStart: "#FFC83F", // Yellow for step 2
      gradientEnd: "#FFDA6B",
    },
    {
      number: 3,
      title: "Build Community",
      description: "Create lasting friendships and memories",
      gradientStart: "#e56822", // Orange for step 3 (matching 1)
      gradientEnd: "#FFA05A",
    },
  ];

  return (
    <div className="step-by-step-container">
      {steps.map((step) => (
        <div key={step.number} className="step-item">
          <div
            className="step-number-circle"
            // Inline style for the gradient, but can be moved to CSS if steps have fixed colors
            style={{
              background: `linear-gradient(to bottom right, ${step.gradientStart}, ${step.gradientEnd})`,
            }}
          >
            {step.number}
          </div>
          <h3 className="step-title">{step.title}</h3>
          <p className="step-description">{step.description}</p>
        </div>
      ))}
    </div>
  );
};

export default StepByStep;
