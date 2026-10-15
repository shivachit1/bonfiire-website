import { useEffect, useRef, useState } from "react";

// Returns a ref and whether that element has scrolled into view.
// Pair with the `.reveal` / `.is-visible` classes in layout.css.
// With `{ watch: true }` it keeps watching after that and also returns
// whether it's in view right now, and how many times it has come into view
// (e.g. to play something only while it's seen, from the start each time).
const useReveal = ({ watch = false } = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(false);
  const [entries, setEntries] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      setInView(true);
      setEntries(1);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (!watch) observer.disconnect();
        }
        if (watch) {
          setInView((was) => {
            if (entry.isIntersecting && !was) setEntries((n) => n + 1);
            return entry.isIntersecting;
          });
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [watch]);

  return [ref, visible, inView, entries];
};

export default useReveal;
