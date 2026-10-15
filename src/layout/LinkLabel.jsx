// A link button's words ("See more →"): the arrow at the end goes in its own span
// (.link-arrow) so it can keep nudging forward on its own.
const LinkLabel = ({ text }) => {
  const match = /^(.*?)\s*→$/.exec(text);
  if (!match) return text;
  return (
    <>
      {match[1]}
      <span className="link-arrow" aria-hidden="true">
        →
      </span>
    </>
  );
};

export default LinkLabel;
