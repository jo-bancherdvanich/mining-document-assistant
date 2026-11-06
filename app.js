import { FILES } from "./data.js";
import { search, buildReply, reportToText } from "./search.js";
import { buildDocumentPreview } from "./documents.js";

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
const thread = document.querySelector("#thread");
const welcome = document.querySelector("#welcome");
const viewer = document.querySelector("#document-viewer");
const viewerBody = document.querySelector("#viewer-body");

document.querySelector("#file-count").textContent = FILES.length;

let answering = false;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

function renderTable({ headers, rows }) {
  const table = element("table", "viewer-table");
  const headerRow = element("tr");
  headerRow.append(...headers.map((header) => element("th", null, header)));
  const head = element("thead");
  head.append(headerRow);
  const body = element("tbody");
  for (const row of rows) {
    const tableRow = element("tr");
    tableRow.append(...row.map((cell) => element("td", null, cell)));
    body.append(tableRow);
  }
  table.append(head, body);
  return table;
}

function openDocument(file) {
  const preview = buildDocumentPreview(file);

  const heading = element("div", "viewer-heading");
  const title = element("h2", null, preview.title);
  title.id = "viewer-title";
  heading.append(renderIcon(file.type), title);

  const details = element("dl", "viewer-details");
  for (const [label, value] of preview.details) {
    const item = element("div");
    item.append(element("dt", null, label), element("dd", null, value));
    details.append(item);
  }

  viewerBody.replaceChildren(
    heading,
    details,
    element("h3", null, "Overview"),
    element("p", null, preview.overview),
    ...preview.sections.flatMap(({ heading: name, text }) => [element("h3", null, name), element("p", null, text)]),
    element("h3", null, preview.table.title),
    renderTable(preview.table),
  );
  viewer.showModal();
  viewerBody.scrollTop = 0;
}

function renderCard(file, number) {
  const card = element("li", "card");
  const body = element("div", "card-body");
  const title = element("div", "card-title");

  const fileButton = element("button", "file-name", file.name);
  fileButton.type = "button";
  fileButton.addEventListener("click", () => openDocument(file));
  title.append(fileButton);
  if (number === 1) title.append(element("span", "best-match", "Best match"));
  body.append(title, renderMeta(file), element("p", "card-passage", file.passage));
  card.append(element("span", "citation", String(number)), renderIcon(file.type), body);
  return card;
}

function renderPoints(items) {
  const points = element("ul", "summary-points");
  for (const { text, source } of items) {
    const point = element("li", null, `${text} `);
    point.append(element("span", "citation", String(source)));
    points.append(point);
  }
  return points;
}

function renderCopyButton(report, files) {
  const button = element("button", "copy-report", "Copy report");
  button.type = "button";
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(reportToText(report, files));
      button.textContent = "Copied";
    } catch {
      button.textContent = "Couldn't copy";
    }
  });
  return button;
}

function renderReport(report, files) {
  const document = element("section", "report");
  document.append(
    element("h3", "report-title", report.title),
    element("p", "report-scope", `Scope: ${report.scope}`),
    element("h4", "report-section", "Key findings"),
    renderPoints(report.findings),
    element("p", "report-note", report.note),
    renderCopyButton(report, files),
  );
  return document;
}

function renderReply(message, result) {
  const reply = buildReply(result);
  if (!reply) {
    message.append(element("p", "hint", NO_MATCH_HINT));
    return;
  }

  message.append(element("h2", "reply-label", "AI answer"), element("p", "reply-intro", reply.intro));
  if (reply.report) {
    message.append(renderReport(reply.report, result.files));
  } else {
    message.append(element("h3", "reply-section", "Summary"), renderPoints(reply.points));
  }

  const sources = element("ol", "cards");
  sources.append(...result.files.map((file, index) => renderCard(file, index + 1)));
  message.append(element("h3", "reply-section", `Sources (${result.files.length})`), sources);
}

function scrollToMessage(node) {
  node.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
}

async function showProgress(message, steps) {
  const progress = element("ol", "progress");
  message.append(progress);
  for (const step of steps) {
    progress.append(element("li", "step", step));
    if (!reducedMotion()) await wait(STEP_DELAY_MS);
  }
  progress.remove();
}

async function ask(question) {
  answering = true;
  welcome.hidden = true;

  const asked = element("p", "user-message", question);
  const message = element("article", "ai-message");
  thread.append(asked, message);
  scrollToMessage(asked);

  const result = search(question, FILES);
  await showProgress(message, result.files.length > 0 ? STEPS : STEPS.slice(0, 1));
  renderReply(message, result);
  scrollToMessage(asked);

  answering = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question || answering) return;
  input.value = "";
  ask(question);
});

document.querySelector("#viewer-close").addEventListener("click", () => viewer.close());
viewer.addEventListener("click", (event) => {
  if (event.target === viewer) viewer.close();
});

input.focus();
