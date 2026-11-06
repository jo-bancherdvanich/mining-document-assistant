import { FILES } from "./data.js";
import { search, formatHeading } from "./search.js";

const STEPS = ["Searching documents", "Found relevant sources", "Writing answer"];
const STEP_DELAY_MS = 500;
const NO_MATCH_HINT = "Try asking about a mining engineering topic, such as gold mine plans or haul trucks.";
const TYPE_LABELS = { pdf: "PDF", docx: "Word", xlsx: "Excel" };

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

function renderCard(file, isBest) {
  const card = element("li", "card");

  const badge = element("span", `type type-${file.type}`, TYPE_LABELS[file.type]);
  const body = element("div", "card-body");
  const title = element("div", "card-title");
  title.append(element("span", "file-name", file.name));
  if (isBest) title.append(element("span", "best-match", "Best match"));

  body.append(
    title,
    element("p", "card-meta", `${file.category} · ${file.year} · ${file.site}`),
    element("p", "card-passage", file.passage),
  );

  card.append(badge, body);
  return card;
}

function renderResults({ files, summary }) {
  results.replaceChildren();

  if (files.length === 0) {
    results.append(element("p", "hint", NO_MATCH_HINT));
  } else {
    const list = element("ol", "cards");
    list.append(...files.map((file, index) => renderCard(file, index === 0)));
    results.append(
      element("h2", "answer-heading", formatHeading(files.length)),
      element("p", "answer-summary", summary),
      list,
    );
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
