// Simulated retrieval: scores files by matching question words. No AI is involved.

import { PREPARED_ANSWERS } from "./data.js";

const normalize = (word) => word.replace(/s$/, "");

const toWords = (text) =>
  text
    .toLowerCase()
    .replace(/['’]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(normalize);

const IGNORED_WORDS = new Set(
  toWords(
    "a about all an and any are as at between by can could do does exist find for from get give has have i in is it looking me my need of on our please show that the there this to us want was we were what whats which with would written you " +
      "report reports file files study studies mining mine engineering company",
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
  const subject = files.length === 1 ? "This file" : "These files";
  const verb = files.length === 1 ? "is" : "are";
  const cover = files.length === 1 ? "covers" : "cover";
  const categories = joinList(topCategories(files));
  const range = years && (years.from === years.to ? `${years.from}` : `${years.from} to ${years.to}`);

  let origin = "";
  if (company && range) origin = `${verb} from ${company}, dated ${range}, and `;
  else if (company) origin = `${verb} from ${company} and `;
  else if (range) origin = `${verb} from ${range} and `;

  return `${subject} ${origin}${cover} ${categories}.`;
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

export function search(question, files) {
  const prepared = findPreparedAnswer(question, files);
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

  return { files: matches, summary: buildSummary(matches, years, company) };
}

export function formatHeading(count) {
  return `We found ${count} relevant ${count === 1 ? "file" : "files"}`;
}
