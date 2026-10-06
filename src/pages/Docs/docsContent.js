import { plainText } from "./DocsBlocks";

// Looking up the docs in docs.json: every page with its category, in order, and
// a page's address (/help-docs/category/page).
export const docsPages = (categories) =>
  categories.flatMap((category) =>
    category.pages.map((page) => ({
      ...page,
      category,
      path: `/help-docs/${category.id}/${page.id}`,
      key: `${category.id}/${page.id}`,
    })),
  );

// All the words of a block, for search (link targets left out).
const blockText = (block) =>
  plainText(
    [
      block.text,
      ...(block.items || []).map((item) =>
        typeof item === "string"
          ? item
          : `${item.title || ""} ${item.text} ${item.note || ""}`,
      ),
    ]
      .filter(Boolean)
      .join(" "),
  );

// Pages (and the section the words were found in) matching every word of the
// query, best first: a match in a page's title, then its summary, then a section.
export const searchDocs = (pages, query) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const has = (text) =>
    words.every((word) => text.toLowerCase().includes(word));
  const results = [];
  pages.forEach((page) => {
    if (has(`${page.title} ${page.category.title}`)) {
      results.push({ page, rank: 0 });
      return;
    }
    if (has(page.summary || "")) {
      results.push({ page, rank: 1 });
      return;
    }
    const section = page.sections.find((s) =>
      has(`${s.title || ""} ${s.blocks.map(blockText).join(" ")}`),
    );
    if (section) results.push({ page, section, rank: 2 });
  });
  return results.sort((a, b) => a.rank - b.rank);
};
