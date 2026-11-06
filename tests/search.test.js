import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, FILES } from "../data.js";
import { search, formatHeading } from "../search.js";

const MAIN = "Can you find me the gold mining report from 2015 to 2017?";
const names = (q) => search(q, FILES).files.map((f) => f.name);

test("main example returns exactly 15 gold files from 2015-2017", () => {
  const { files } = search(MAIN, FILES);
  assert.equal(files.length, 15);
  assert.ok(files.every((f) => f.commodity === "gold" && f.year >= 2015 && f.year <= 2017));
});

test("the main example's best match is a gold mining plan", () => {
  assert.equal(search(MAIN, FILES).files[0].category, "Gold Mining Plan");
});

test("asking for a mine plan puts a gold mining plan first, not a maintenance plan", () => {
  assert.equal(search("Show me the mine plans", FILES).files[0].category, "Gold Mining Plan");
  assert.equal(search("Show me the mine plan for 2016", FILES).files[0].category, "Gold Mining Plan");
});

test("three years in a question cover the whole span", () => {
  const { files, summary } = search("gold reports for 2015, 2016 and 2017", FILES);
  assert.equal(files.length, 15);
  assert.match(summary, /2015 to 2017/);
});

test("time-only questions in natural wording return the whole range", () => {
  assert.equal(
    search("What reports are there from 2015 to 2017?", FILES).files.length,
    FILES.filter((f) => f.year >= 2015 && f.year <= 2017).length,
  );
  assert.equal(
    search("Which files were written in 2016?", FILES).files.length,
    FILES.filter((f) => f.year === 2016).length,
  );
});

test("each example question returns at least one file", () => {
  for (const q of [MAIN, "Show me haul truck studies from 2016 to 2018", "Find the tailings engineering reports"]) {
    assert.ok(search(q, FILES).files.length > 0, q);
  }
});

test("library has 48 files, 6 per category, and all three types", () => {
  assert.equal(FILES.length, 48);
  assert.equal(CATEGORIES.length, 8);
  for (const c of CATEGORIES) assert.equal(FILES.filter((f) => f.category === c).length, 6);
  assert.deepEqual([...new Set(FILES.map((f) => f.type))].sort(), ["docx", "pdf", "xlsx"]);
  assert.ok(FILES.every((f) => f.year >= 2013 && f.year <= 2020));
});

test("all year formats read the same range", () => {
  const expected = names("gold from 2015 to 2017");
  assert.deepEqual(names("gold 2015-2017"), expected);
  assert.deepEqual(names("gold between 2015 and 2017"), expected);
});

test("a reversed range matches the forward range", () => {
  assert.deepEqual(names("gold from 2017 to 2015"), names("gold from 2015 to 2017"));
});

test("a single year keeps only that year", () => {
  const { files } = search("gold in 2016", FILES);
  assert.ok(files.length > 0 && files.every((f) => f.year === 2016));
});

test("results and summary change with the year range", () => {
  const wide = search("gold from 2015 to 2017", FILES);
  const narrow = search("gold from 2015 to 2015", FILES);
  assert.ok(narrow.files.length < wide.files.length);
  assert.notEqual(narrow.summary, wide.summary);
  assert.match(wide.summary, /2015 to 2017/);
});

test("capitals and punctuation do not change results", () => {
  assert.deepEqual(names("GOLD report?"), names("gold report"));
});

test("plurals match singular", () => {
  assert.deepEqual(names("haul trucks"), names("haul truck"));
});

test("unrelated, common-word-only and empty questions return nothing", () => {
  for (const q of ["What's the weather today?", "can you find me the", "", "   "]) {
    assert.equal(search(q, FILES).files.length, 0, JSON.stringify(q));
  }
});

test("a year range with no topic returns every file in the range", () => {
  assert.equal(
    search("from 2015 to 2016", FILES).files.length,
    FILES.filter((f) => f.year >= 2015 && f.year <= 2016).length,
  );
});

test("name and category matches rank above passage matches", () => {
  const sample = [
    { name: "Crusher_Plan_2020.pdf", type: "pdf", category: "Equipment & Maintenance", year: 2020, commodity: "copper", site: "Red Ridge", passage: "Includes a tailings note." },
    { name: "Tailings_Dam_2015.pdf", type: "pdf", category: "Tailings Engineering", year: 2015, commodity: "gold", site: "Red Ridge", passage: "Dam review." },
  ];
  assert.equal(search("tailings", sample).files[0].name, "Tailings_Dam_2015.pdf");
});

test("ties go to the newest year, then name", () => {
  const f = (name, year) => ({ name, type: "pdf", category: "Haul Truck", year, commodity: "gold", site: "Red Ridge", passage: "Fleet." });
  const result = search("haul", [f("B_2016.pdf", 2016), f("C_2017.pdf", 2017), f("A_2016.pdf", 2016)]);
  assert.deepEqual(result.files.map((x) => x.name), ["C_2017.pdf", "A_2016.pdf", "B_2016.pdf"]);
});

test("heading handles one and many", () => {
  assert.equal(formatHeading(15), "We found 15 relevant files");
  assert.equal(formatHeading(1), "We found 1 relevant file");
});
