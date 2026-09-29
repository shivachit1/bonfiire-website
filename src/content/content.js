// Helpers for the JSON files in this folder.
import photos from "../assets/photos";

// Items marked "example": true are placeholders. They show while developing
// (npm start) but are left out of every production build, so sample
// testimonials or partners can never go live by accident.
const showExamples = process.env.NODE_ENV === "development";

export const visible = (items = []) =>
  items.filter((item) => showExamples || !item.example);

// "/partners/logo.png" → file in public/partners/logo.png. Full URLs pass through.
export const asset = (path) =>
  path && !path.startsWith("http") ? `${process.env.PUBLIC_URL}${path}` : path;

// A photo name from src/assets/photos ("tug-of-war"), or a public path / URL.
export const image = (name) => photos[name] || asset(name);
