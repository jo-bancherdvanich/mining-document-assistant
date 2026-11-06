// Simulated retrieval: scores files by matching question words. No AI is involved.

import { PREPARED_ANSWERS } from "./data.js";

const normalize = (word) => word.replace(/s$/, "");

const rawWords = (text) =>
  text
    .replace(/['’]/g, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

const toWords = (text) => rawWords(text.toLowerCase()).map(normalize);

const IGNORED_WORDS = new Set(
  toWords(
    "a about all an and any are as at between by can could do does exist find for from get give has have i in is it looking me my need of on our please show that the there this to us want was we were what whats which with would written you " +
      "report reports file files study studies mining mine engineering company " +
      "create draft finding findings make old send write writing",
  ),
);

const NAME_SCORE = 3;
const OTHER_SCORE = 1;

function parseYears(question) {
  const years = (question.match(/\b(?:19|20)\d{2}\b/g) ?? []).map(Number);
  if (years.length === 0) return null;
  return { from: Math.min(...years), to: Math.max(...years) };
}

function parseTopics(question) {
  const withoutYears = question.replace(/\b(?:19|20)\d{2}\b/g, " ");
  return [...new Set(toWords(withoutYears))].filter(
    (word) => !IGNORED_WORDS.has(word) && !/^\d+$/.test(word),
  );
}

function scoreFile(file, topics) {
  const primary = new Set(toWords(`${file.name} ${file.category}`));
  const secondary = new Set(toWords(`${file.commodity} ${file.site} ${file.passage}`));
  return topics.reduce((total, topic) => {
    if (primary.has(topic)) return total + NAME_SCORE;
    if (secondary.has(topic)) return total + OTHER_SCORE;
    return total;
  }, 0);
}

function joinList(items) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function topCategories(files) {
  const counts = new Map();
  for (const file of files) counts.set(file.category, (counts.get(file.category) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);
}

function buildSummary(files, years, company) {
  if (files.length === 0) return "";
  const opener = files.length === 1 ? "Here is the file" : "Here are the files";
  const categories = joinList(topCategories(files));
  const range = years && (years.from === years.to ? `${years.from}` : `${years.from} to ${years.to}`);

  let origin = "";
  if (company && range) origin = ` from ${company}, dated ${range},`;
  else if (company) origin = ` from ${company},`;
  else if (range) origin = ` from ${range},`;

  return `${opener}${origin} covering ${categories}.`;
}

// A company is recognized by the first word of its name, such as "Harlow" for Harlow Ridge.
function findCompany(question, files) {
  const words = new Set(toWords(question));
  const companies = new Set(files.map((file) => file.site));
  return [...companies].find((company) => words.has(toWords(company)[0])) ?? null;
}

function findPreparedAnswer(question, files) {
  const words = new Set(toWords(question));
  for (const { keywords, answer, sources } of PREPARED_ANSWERS) {
    if (!toWords(keywords.join(" ")).every((word) => words.has(word))) continue;
    const sourceFiles = sources.map((name) => files.find((file) => file.name === name));
    if (sourceFiles.every(Boolean)) return { answer, files: sourceFiles, summary: "" };
  }
  return null;
}

function isReportRequest(question) {
  const words = new Set(toWords(question));
  return words.has("write") && words.has("report");
}

function formatRange(years) {
  return years.from === years.to ? `${years.from}` : `${years.from} to ${years.to}`;
}

function buildReportDetails(question, files, topics, years, company) {
  const topicText = [...new Set(rawWords(question).filter((word) => topics.includes(normalize(word.toLowerCase()))))]
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  const titleParts = [topicText, company, years && formatRange(years)].filter(Boolean);

  const fileYears = files.map((file) => file.year);
  const span = formatRange({ from: Math.min(...fileYears), to: Math.max(...fileYears) });
  const count = `${files.length} ${files.length === 1 ? "file" : "files"}`;

  return {
    title: `Findings Report: ${titleParts.join(", ")}`,
    scope: `${count} from ${span}${company ? ` for ${company}` : ""}`,
  };
}

export function search(question, files) {
  const wantsReport = isReportRequest(question);
  const prepared = wantsReport ? null : findPreparedAnswer(question, files);
  if (prepared) return prepared;

  const years = parseYears(question);
  const company = findCompany(question, files);
  const companyWords = new Set(company ? toWords(company) : []);
  const topics = parseTopics(question).filter((word) => !companyWords.has(word));
  if (!years && !company && topics.length === 0) return { files: [], summary: "" };

  const inScope = files.filter(
    (file) =>
      (!years || (file.year >= years.from && file.year <= years.to)) &&
      (!company || file.site === company),
  );

  const matches = inScope
    .map((file) => ({ file, score: scoreFile(file, topics) }))
    .filter(({ score }) => topics.length === 0 || score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.file.year - a.file.year ||
        a.file.name.localeCompare(b.file.name),
    )
    .map(({ file }) => file);

  const result = { files: matches, summary: buildSummary(matches, years, company) };
  if (wantsReport && matches.length > 0) {
    result.report = buildReportDetails(question, matches, topics, years, company);
  }
  return result;
}

export function formatHeading(count) {
  return `We found ${count} relevant ${count === 1 ? "file" : "files"}`;
}

const SUMMARY_POINTS = 3;
const DRAFT_NOTE = "Draft: check against the source files before sending to a client.";

const numberedPassages = (files) =>
  files.map((file, index) => ({ text: file.passage, source: index + 1 }));

// Shapes a search result into the simulated AI reply. Summary points and report
// findings are the files' passages, so they always match the sources shown.
export function buildReply({ answer, files, summary, report }) {
  if (files.length === 0) return null;
  if (report) {
    const count = `${files.length} relevant ${files.length === 1 ? "file" : "files"}`;
    return {
      intro: `Here is a draft report based on ${count}.`,
      points: [],
      report: { ...report, findings: numberedPassages(files), note: DRAFT_NOTE },
    };
  }
  return {
    intro: answer ?? `${formatHeading(files.length)}. ${summary}`,
    points: numberedPassages(files.slice(0, SUMMARY_POINTS)),
  };
}

export function reportToText(report, files) {
  return [
    report.title,
    "",
    `Scope: ${report.scope}`,
    "",
    "Key findings",
    ...report.findings.map(({ text, source }) => `- ${text} [${source}]`),
    "",
    "Sources",
    ...files.map((file, index) => `${index + 1}. ${file.name}`),
    "",
    report.note,
  ].join("\n");
}
