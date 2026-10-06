import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  LuChevronLeft,
  LuChevronRight,
  LuMenu,
  LuSearch,
  LuX,
} from "react-icons/lu";
import "./docs.css";
import { useContent, useLanguage } from "../../i18n";
import DocsBlock from "./DocsBlocks";
import { docsPages, searchDocs } from "./docsContent";

// The docs-style help center (/help-docs/:categoryId/:pageId), alongside the
// simpler /help: a sidebar of categories and their pages with a search box over
// it (a menu that slides in on phones and tablets), and the page beside it (its
// sections, then related pages and Previous / Next).
// All text lives in src/content/<language>/docs.json.

// The sidebar's tree: categories, with those belonging to a `part` ("For
// participants") gathered under it. [{ id, title, pages } | { id, title,
// isPart: true, categories }]
const navTree = (categories) => {
  const tree = [];
  categories.forEach((category) => {
    if (!category.part) {
      tree.push(category);
      return;
    }
    let part = tree.find((node) => node.isPart && node.title === category.part);
    if (!part) {
      part = {
        id: `part-${tree.length}`,
        title: category.part,
        isPart: true,
        categories: [],
      };
      tree.push(part);
    }
    part.categories.push(category);
  });
  return tree;
};

// A branch's name with its arrow on the right: a button that opens or closes
// what's under it.
const Toggle = ({ open, controls, className, onClick, children }) => (
  <button
    type="button"
    className={`docs-nav-toggle ${className}`}
    aria-expanded={open}
    aria-controls={controls}
    onClick={onClick}
  >
    <span>{children}</span>
    <LuChevronRight className="docs-nav-arrow" aria-hidden="true" />
  </button>
);

// The sidebar: the search box, then either the search results or the tree of
// parts, categories and pages. A part, and a category with more than one page,
// opens and closes with its arrow; a one-page category always shows its page.
// The branch holding the current page starts open, the others closed; each level
// sits a little further in. The current page is marked in the highlight colour.
const DocsNav = ({ categories, pages, current, labels, onPick }) => {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchDocs(pages, query), [pages, query]);
  const tree = useMemo(() => navTree(categories), [categories]);

  // What's open: what the visitor opened or closed, else whether it holds the
  // current page. Going to a page opens the branches holding it, and they stay
  // open (until closed) when you move on.
  const [toggled, setToggled] = useState({});
  const currentCategory = current.split("/")[0];
  const holdsCurrent = (node) =>
    node.isPart
      ? node.categories.some((category) => category.id === currentCategory)
      : node.id === currentCategory;
  const isOpen = (node) => toggled[node.id] ?? holdsCurrent(node);
  const toggle = (node) =>
    setToggled((now) => ({ ...now, [node.id]: !isOpen(node) }));
  useEffect(() => {
    const part = tree.find(
      (node) =>
        node.isPart &&
        node.categories.some((category) => category.id === currentCategory),
    );
    setToggled((now) => ({
      ...now,
      [currentCategory]: true,
      ...(part ? { [part.id]: true } : {}),
    }));
  }, [tree, currentCategory]);

  // The list can be longer than the screen: on a new page, scroll the sidebar
  // (only the sidebar, not the page) so the current page's link is in view.
  const navRef = useRef(null);
  useEffect(() => {
    const link = navRef.current?.querySelector(".docs-nav-link.is-current");
    const box = navRef.current?.closest(".docs-sidebar");
    if (!link || !box) return;
    const linkTop = link.getBoundingClientRect().top;
    const boxTop = box.getBoundingClientRect().top;
    const offset = linkTop - boxTop;
    if (offset < 0 || offset > box.clientHeight - link.offsetHeight) {
      box.scrollTop += offset - box.clientHeight / 3;
    }
  }, [current]);

  const pageLinks = (category) => (
    <ul className="docs-nav-children" id={`docs-nav-${category.id}`}>
      {category.pages.map((page) => {
        const key = `${category.id}/${page.id}`;
        return (
          <li key={page.id}>
            <Link
              className={`docs-nav-link${key === current ? " is-current" : ""}`}
              aria-current={key === current ? "page" : undefined}
              to={`/help-docs/${key}`}
              onClick={onPick}
            >
              {page.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const categoryItem = (category) => {
    const branch = category.pages.length > 1;
    const open = !branch || isOpen(category);
    return (
      <li key={category.id} className="docs-nav-item">
        {branch ? (
          <Toggle
            open={open}
            controls={`docs-nav-${category.id}`}
            className="docs-nav-category"
            onClick={() => toggle(category)}
          >
            {category.title}
          </Toggle>
        ) : (
          <p className="docs-nav-category docs-nav-category--leaf">
            {category.title}
          </p>
        )}
        {open && pageLinks(category)}
      </li>
    );
  };

  return (
    <nav ref={navRef} className="docs-nav" aria-label={labels.menu}>
      <label className="docs-search">
        <LuSearch aria-hidden="true" />
        <input
          type="search"
          value={query}
          placeholder={labels.search}
          aria-label={labels.search}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {query.trim() ? (
        results.length ? (
          <ul className="docs-results">
            {results.map(({ page, section }) => (
              <li key={page.key}>
                <Link
                  to={`${page.path}${section ? `#${section.id}` : ""}`}
                  onClick={onPick}
                >
                  <span className="docs-result-title">{page.title}</span>
                  <span className="docs-result-where">
                    {page.category.title}
                    {section?.title ? ` › ${section.title}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="docs-no-results">{labels.noResults}</p>
        )
      ) : (
        <ul className="docs-nav-tree">
          {tree.map((node) =>
            node.isPart ? (
              <li key={node.id} className="docs-nav-item">
                <Toggle
                  open={isOpen(node)}
                  controls={`docs-nav-${node.id}`}
                  className="docs-nav-part"
                  onClick={() => toggle(node)}
                >
                  {node.title}
                </Toggle>
                {isOpen(node) && (
                  <ul className="docs-nav-children" id={`docs-nav-${node.id}`}>
                    {node.categories.map(categoryItem)}
                  </ul>
                )}
              </li>
            ) : (
              categoryItem(node)
            ),
          )}
        </ul>
      )}
    </nav>
  );
};

const DocsPage = () => {
  const { categoryId, pageId } = useParams();
  const { categories, labels } = useContent("docs");
  const { language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const pages = useMemo(() => docsPages(categories), [categories]);

  const index = pages.findIndex(
    (page) => page.category.id === categoryId && page.id === pageId,
  );

  // A page change closes the menu; the open menu closes with Escape and keeps
  // the page behind it from scrolling.
  useEffect(() => setMenuOpen(false), [categoryId, pageId]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.classList.add("docs-menu-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("docs-menu-open");
    };
  }, [menuOpen]);

  if (index === -1) return <Navigate to={pages[0].path} replace />;
  const page = pages[index];
  const previous = pages[index - 1];
  const next = pages[index + 1];
  const related = (page.related || [])
    .map((key) => pages.find((p) => p.key === key))
    .filter(Boolean);
  const updated =
    page.updated &&
    new Intl.DateTimeFormat(language, { dateStyle: "long" }).format(
      new Date(page.updated),
    );

  return (
    <div className="docs">
      <div className="docs-layout">
        <aside className={`docs-sidebar${menuOpen ? " is-open" : ""}`}>
          <div className="docs-sidebar-head">
            <span>{labels.menu}</span>
            <button
              type="button"
              className="docs-icon-button"
              aria-label={labels.close}
              onClick={() => setMenuOpen(false)}
            >
              <LuX aria-hidden="true" />
            </button>
          </div>
          <DocsNav
            categories={categories}
            pages={pages}
            current={page.key}
            labels={labels}
            onPick={() => setMenuOpen(false)}
          />
        </aside>
        {menuOpen && (
          <div
            className="docs-backdrop"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Keyed by page, so each new page fades in. */}
        <article key={page.key} className="docs-main">
          <button
            type="button"
            className="docs-menu-button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <LuMenu aria-hidden="true" />
            <span className="docs-menu-button-topic">
              {page.category.title}
            </span>
          </button>

          <header className="docs-header">
            <h1 className="docs-title">{page.title}</h1>
          </header>

          {/* The summary opens the page as its first paragraph. */}
          {page.summary && (
            <div className="docs-intro">
              <p className="docs-p">{page.summary}</p>
            </div>
          )}

          {page.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className={`docs-section${section.title ? "" : " docs-section--intro"}`}
            >
              {section.title && (
                <h2 className="docs-section-title">{section.title}</h2>
              )}
              {section.blocks.map((block, i) => (
                <DocsBlock key={i} block={block} labels={labels} />
              ))}
            </section>
          ))}

          {related.length > 0 && (
            <section className="docs-related">
              <h2 className="docs-related-title">{labels.related}</h2>
              <ul>
                {related.map((p) => (
                  <li key={p.key}>
                    <Link to={p.path}>
                      {p.title}
                      <LuChevronRight aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <footer className="docs-footer">
            {updated && (
              <p className="docs-updated">
                {labels.updated}: {updated}
              </p>
            )}
            <div className="docs-pager">
              {previous && (
                <Link className="docs-pager-link" to={previous.path}>
                  <span className="docs-pager-label">
                    <LuChevronLeft aria-hidden="true" />
                    {labels.previous}
                  </span>
                  <span className="docs-pager-title">{previous.title}</span>
                </Link>
              )}
              {next && (
                <Link
                  className="docs-pager-link docs-pager-link--next"
                  to={next.path}
                >
                  <span className="docs-pager-label">
                    {labels.next}
                    <LuChevronRight aria-hidden="true" />
                  </span>
                  <span className="docs-pager-title">{next.title}</span>
                </Link>
              )}
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
};

export default DocsPage;
