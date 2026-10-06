import { useCallback, useEffect, useRef, useState } from "react";

// A row of cards you scroll sideways, with dots under it (ServiceList, HelpRoute).
// Returns the list's ref, which card is current (the one at the row's start, or
// the last once it's scrolled to the end), whether the cards overflow the row at
// all (`scrolls`: no dots needed when they all fit), an onScroll handler for the
// list and goTo(i), which scrolls card i to the start.
const useCardRow = (enabled = true) => {
  const listRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [scrolls, setScrolls] = useState(true);

  // Where each card starts along the row.
  const cardLefts = () => {
    const list = listRef.current;
    if (!list) return [];
    const cards = [...list.children];
    return cards.map((card) => card.offsetLeft - cards[0].offsetLeft);
  };
  const update = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const lefts = cardLefts();
    setScrolls(list.scrollWidth > list.clientWidth + 4);
    if (list.scrollLeft >= list.scrollWidth - list.clientWidth - 4) {
      setCurrent(lefts.length - 1);
      return;
    }
    let nearest = 0;
    lefts.forEach((left, i) => {
      if (
        Math.abs(left - list.scrollLeft) <
        Math.abs(lefts[nearest] - list.scrollLeft)
      ) {
        nearest = i;
      }
    });
    setCurrent(nearest);
  }, []);
  useEffect(() => {
    if (!enabled) return undefined;
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [enabled, update]);
  const goTo = (i) => {
    const still = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    listRef.current?.scrollTo({
      left: cardLefts()[i],
      behavior: still ? "auto" : "smooth",
    });
  };

  return {
    listRef,
    current,
    scrolls,
    onScroll: enabled ? update : undefined,
    goTo,
  };
};

export default useCardRow;
