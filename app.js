import { FILES } from "./data.js";
import { search, formatHeading } from "./search.js";

const STEPS = ["Searching documents", "Found relevant sources", "Writing answer"];
const STEP_DELAY_MS = 500;
const NO_MATCH_HINT = "Try asking about a mining engineering topic, such as gold mine plans or haul trucks.";
const FILE_ICONS = {
  pdf: { label: "PDF file", letter: "PDF", size: 13 },
  docx: { label: "Word file", letter: "W", size: 20 },
  xlsx: { label: "Excel file", letter: "X", size: 20 },
};
const SVG_NS = "http://www.w3.org/2000/svg";

const form = document.querySelector("#search-form");
const input = document.querySelector("#question");
const progress = document.querySelector("#progress");
const results = document.querySelector("#results");

document.querySelector("#file-count").textContent = FILES.length;

let latestRequest = 0;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function svgElement(tag, attributes) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

function renderIcon(type) {
  const { label, letter, size } = FILE_ICONS[type];
  const icon = svgElement("svg", {
    class: `type type-${type}`,
    viewBox: "0 0 40 48",
    role: "img",
    "aria-label": label,
  });
  const text = svgElement("text", {
    x: 20,
    y: 37,
    "text-anchor": "middle",
    "font-size": size,
    "font-weight": 700,
    fill: "#ffffff",
  });
  text.textContent = letter;
  icon.append(
    svgElement("path", {
      d: "M4 0h22l14 14v30a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z",
      fill: "currentColor",
    }),
    svgElement("path", {
      d: "M26 0l14 14H30a4 4 0 0 1-4-4z",
      fill: "#ffffff",
      "fill-opacity": 0.5,
    }),
    text,
  );
  return icon;
}

function renderMeta(file) {
  const meta = element("p", "card-meta");
  const items = [
    ["Category", file.category],
    ["Year", file.year],
    ["Company", file.site],
  ];
  for (const [label, value] of items) {
    const item = element("span", "meta-item");
    item.append(element("strong", "meta-label", `${label}: `), String(value));
    meta.append(item);
  }
  return meta;
}

function renderCard(file, isBest) {
  const card = element("li", "card");

  const badge = renderIcon(file.type);
  const body = element("div", "card-body");
  const title = element("div", "card-title");
  title.append(element("span", "file-name", file.name));
  if (isBest) title.append(element("span", "best-match", "Best match"));

  body.append(
    title,
    renderMeta(file),
    element("p", "card-passage", file.passage),
  );

  card.append(badge, body);
  return card;
}

function renderResults({ answer, files, summary }) {
  results.replaceChildren();

  if (files.length === 0) {
    results.append(element("p", "hint", NO_MATCH_HINT));
  } else {
    const list = element("ol", "cards");
    list.append(...files.map((file, index) => renderCard(file, index === 0)));
    if (answer) {
      results.append(
        element("h2", "answer-heading", "Answer"),
        element("p", "answer-text", answer),
        element("h3", "source-heading", files.length === 1 ? "Source" : "Sources"),
      );
    } else {
      results.append(
        element("h2", "answer-heading", formatHeading(files.length)),
        element("p", "answer-summary", summary),
      );
    }
    results.append(list);
  }

  results.hidden = false;
}

async function ask(question) {
  const request = ++latestRequest;
  const answer = search(question, FILES);
  const steps = answer.files.length > 0 ? STEPS : STEPS.slice(0, 1);
  const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  results.hidden = true;
  progress.replaceChildren();
  progress.hidden = false;

  for (const step of steps) {
    progress.append(element("li", "step", step));
    if (!instant) await wait(STEP_DELAY_MS);
    if (request !== latestRequest) return;
  }

  renderResults(answer);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (question) ask(question);
});

for (const button of document.querySelectorAll(".example")) {
  button.addEventListener("click", () => {
    input.value = button.textContent;
    form.requestSubmit();
  });
}
