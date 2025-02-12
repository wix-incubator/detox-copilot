import { ElementCategory } from "./types";

const roleToCategory: Record<string, ElementCategory> = {
  // Interactive roles
  button: "button",
  checkbox: "input",
  radio: "input",
  switch: "input",
  link: "link",
  textbox: "input",
  searchbox: "input",
  combobox: "input",
  listbox: "input",
  slider: "input",
  spinbutton: "input",

  // Structural roles
  list: "list",
  listitem: "list",
  table: "table",
  grid: "table",
  treegrid: "table",
  columnheader: "table",
  rowheader: "table",
  heading: "header",

  // Semantic/landmark roles
  article: "semantic",
  navigation: "semantic",
  banner: "semantic",
  complementary: "semantic",
  contentinfo: "semantic",
  main: "semantic",
  region: "semantic",
  form: "semantic",
  search: "semantic",
};

const tagToCategory: Record<
  string,
  ElementCategory | ((el: Element) => ElementCategory | undefined)
> = {
  // Interactive elements
  button: "button",
  a: (el) => (el.hasAttribute("href") ? "link" : undefined),
  input: "input",
  select: "input",
  textarea: "input",

  // Structural elements
  ul: (el) => (hasListChildren(el) ? "list" : undefined),
  ol: (el) => (hasListChildren(el) ? "list" : undefined),
  table: (el) => (hasTableStructure(el) ? "table" : undefined),

  // Headers
  h1: "header",
  h2: "header",
  h3: "header",
  h4: "header",
  h5: "header",
  h6: "header",

  // Semantic HTML5 elements
  article: "semantic",
  aside: "semantic",
  footer: "semantic",
  header: "semantic",
  main: "semantic",
  nav: "semantic",
  section: "semantic",
  form: "semantic",
  search: "semantic",
  span: (el) => (isInteractiveSemantic(el) ? "button" : undefined),
  div: (el) => (isInteractiveSemantic(el) ? "button" : undefined),
};

export const tags = Object.keys(tagToCategory);

function getElementCategory(el: Element): ElementCategory | undefined {
  const role = el.getAttribute("role")?.toLowerCase();
  if (role && roleToCategory[role]) {
    return roleToCategory[role];
  }

  const tag = el.tagName.toLowerCase();
  const categoryResolver = tagToCategory[tag];

  if (typeof categoryResolver === "function") {
    return categoryResolver(el);
  } else if (categoryResolver) {
    return categoryResolver;
  }

  // TODO: content editable --> input
  // TODO: cursor auto --> input
  return isCustomInteractiveElement(el) ? "button" : undefined;
}

function isParentMarkedAsButton(el: Element, depth = 0, maxDepth = 2): boolean {
  if (depth > maxDepth) {
    // Check for depth limit
    return false;
  }
  const parent = el.parentElement;
  if (parent) {
    const ariaPilotCategory = parent.getAttribute("aria-pilot-category");
    const clickableCategories = ["button", "link", "input"]; // Include other clickable categories as needed
    if (clickableCategories.includes(ariaPilotCategory ?? "")) {
      return true;
    }
    return isParentMarkedAsButton(parent, depth++, maxDepth);
  }
  return false;
}

/** Heuristic: Only consider interactive semantics */
function isInteractiveSemantic(el: Element): boolean {
  const isInteractive = isCustomInteractiveElement(el);
  const isParentAlreadyMarked = isParentMarkedAsButton(el);
  return isInteractive && !isParentAlreadyMarked;
}

/** Heuristic: Only consider lists with visible children */
function hasListChildren(el: Element): boolean {
  return Array.from(el.children).some((child) => {
    const style = window.getComputedStyle(child);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

/** Heuristic: Verify table has proper structure */
function hasTableStructure(el: Element): boolean {
  return el.querySelector("thead, tbody, tfoot, tr, td, th") !== null;
}

function hasPointerCursor(el: Element): boolean {
  const cursorStyle = window.getComputedStyle(el).cursor;
  if (cursorStyle === "pointer") {
    const isParentAlreadyMarked = isParentMarkedAsButton(el);
    return !isParentAlreadyMarked;
  } else {
    return false;
  }
}

/** Detect web components with button-like behavior */
function isCustomInteractiveElement(el: Element): boolean {
  const pointerCursor = hasPointerCursor(el);
  return (
    el instanceof HTMLElement &&
    (el.tabIndex >= 0 ||
      el.hasAttribute("onclick") ||
      el.getAttribute("role") === "button" ||
      pointerCursor)
  );
}

export default getElementCategory;
