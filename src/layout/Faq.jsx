import "./layout.css";

// Questions that open on tap. items: [{ question, answer }]
const Faq = ({ items }) => (
  <div className="faq">
    {items.map((item) => (
      <details key={item.question} className="faq-item">
        <summary>{item.question}</summary>
        <p className="faq-answer">{item.answer}</p>
      </details>
    ))}
  </div>
);

export default Faq;
