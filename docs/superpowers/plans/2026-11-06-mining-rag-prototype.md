# Mining Engineering RAG Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static website that simulates a RAG document assistant for a mining engineering consultancy: ask a question, see search progress, get an answer and source files.

**Architecture:** `data.js` holds the fake library. `search.js` is pure logic with no page code, so Node can test it. `app.js` connects `search.js` to the page in `index.html` and `styles.css`.

**Tech Stack:** HTML, CSS, JavaScript modules, Node's built-in test runner (`node --test`). No dependencies or build step.

**Spec:** `docs/superpowers/specs/2026-11-06-mining-rag-prototype-design.md`

## Global Constraints

- No real AI, embeddings, API keys, server, runtime dependencies or build step.
- All files, passages and site names are made up. Use no real companies or mine sites.
- The page always shows the label "Prototype: simulated answers".
- Counts and summaries come from the results and are never hardcoded.
- Results are listings only. Nothing opens, previews or downloads.
- Do not create a git repository, commit or push until the user confirms. This replaces the usual commit step at the end of each task.

## Review Focus

- An empty or spaces-only question should do nothing, not show results or an error.
- A reversed range such as "2017 to 2015" should behave the same as "2015 to 2017".
- Capital letters and punctuation, such as "GOLD report?", should give the same results as "gold report".
- A question made only of common words, such as "can you find me the", should show the no-match hint.
- Asking a new question during the progress steps should show only the newest result, never an older one arriving late.

---

### Task 1: Sample library and search logic

**Files:**
- Create: `package.json`, `data.js`, `search.js`
- Test: `tests/search.test.js`

**Interfaces:**
- Produces: `export const CATEGORIES: string[]` and `export const FILES: FileRecord[]` from `data.js`, where `FileRecord` is `{ name, type: "pdf"|"docx"|"xlsx", category, year: number, commodity, site, passage }`
- Produces: `export function search(question: string, files: FileRecord[]): { files: FileRecord[], summary: string }` from `search.js`
- Produces: `export function formatHeading(count: number): string` from `search.js`, returning "We found 15 relevant files" or "We found 1 relevant file"

- [ ] **Step 1: Create `package.json`** with `"type": "module"`, `"private": true`, the script `"test": "node --test tests/"` and no dependencies.

- [ ] **Step 2: Write the failing tests in `tests/search.test.js`**

```js
const MAIN = "Can you find me the gold mining report from 2015 to 2017?";

test("main example returns exactly 15 gold files from 2015-2017", () => {
  const { files } = search(MAIN, FILES);
  assert.equal(files.length, 15);
  assert.ok(files.every(f => f.commodity === "gold" && f.year >= 2015 && f.year <= 2017));
});

test("each example question returns at least one file", () => {
  for (const q of [MAIN, "Show me haul truck studies from 2016 to 2018", "Find the tailings engineering reports"]) {
    assert.ok(search(q, FILES).files.length > 0, q);
  }
});

test("library has 48 files, 6 per category, and all three types", () => {
  assert.equal(FILES.length, 48);
  assert.equal(CATEGORIES.length, 8);
  for (const c of CATEGORIES) assert.equal(FILES.filter(f => f.category === c).length, 6);
  assert.deepEqual([...new Set(FILES.map(f => f.type))].sort(), ["docx", "pdf", "xlsx"]);
  assert.ok(FILES.every(f => f.year >= 2013 && f.year <= 2020));
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
  assert.ok(files.length > 0 && files.every(f => f.year === 2016));
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
  assert.equal(search("from 2015 to 2016", FILES).files.length,
    FILES.filter(f => f.year >= 2015 && f.year <= 2016).length);
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
  assert.deepEqual(result.files.map(x => x.name), ["C_2017.pdf", "A_2016.pdf", "B_2016.pdf"]);
});

test("heading handles one and many", () => {
  assert.equal(formatHeading(15), "We found 15 relevant files");
  assert.equal(formatHeading(1), "We found 1 relevant file");
});
```

`names(q)` is a test helper returning `search(q, FILES).files.map(f => f.name)`. Imports come from `../data.js` and `../search.js`.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL because the modules don't exist.

- [ ] **Step 4: Create `data.js`** with the 8 spec categories in `CATEGORIES` and 48 file records, 6 per category. Requirements:
  - Include the spec's named example files, such as `Gold_Mine_Plan_Summary_2016.pdf` and `Haul_Truck_Fleet_Sizing_2015.xlsx`.
  - Exactly 15 records have commodity `gold` and a year from 2015 to 2017.
  - The word "gold" appears only in records with commodity `gold`, so the main count stays exact.
  - Other commodities are `copper`, `iron ore` and `coal`. Each passage is one realistic engineering sentence with invented figures.

- [ ] **Step 5: Implement `search` and `formatHeading` in `search.js`** following the spec's Search behavior section. Use these exact word lists:
  - Common words: `a, about, all, an, and, any, are, between, can, could, do, for, from, get, give, have, i, in, is, looking, me, my, need, of, on, our, please, show, that, the, to, us, want, we, what, whats, which, with, would, you`
  - Generic words: `report, reports, file, files, study, studies, mining, mine, engineering`
  - Compare words after lowercasing, removing punctuation and removing a trailing "s".
  - Score each topic word: 3 for a name or category match, 1 for a commodity, site or passage match. Split names on `_`, `.` and spaces so words match whole.
  - The summary states the years if given and up to three categories from the results, most common first: "These files are from 2015 to 2017 and cover Gold Mining Plan, Haul Truck and Drill & Blast." Empty results give an empty summary.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test`
Expected: all tests PASS.

---

### Task 2: The website page

**Files:**
- Create: `index.html`, `styles.css`, `app.js`

**Interfaces:**
- Consumes: `FILES` from `data.js`; `search`, `formatHeading` from `search.js`

- [ ] **Step 1: Create `index.html`** with the page title, the "Prototype: simulated answers" label, a `<form>` holding a labeled search input and submit button, the three example questions from the spec as `<button>` elements, and empty `aria-live="polite"` regions for progress and results. Load `app.js` with `<script type="module">`.

- [ ] **Step 2: Implement `app.js`**
  - On submit, ignore empty or spaces-only input. Clicking an example fills the input and submits.
  - Show the spec's three progress steps across about 1.5 seconds. If `prefers-reduced-motion: reduce` is set, show them with no animation or delay.
  - Keep a request counter and drop results from anything but the newest question.
  - With results, show `formatHeading(count)`, the summary, and one card per file with its type icon, name, category, year and passage. Mark the first card "Best match".
  - With no results, show exactly: "Try asking about a mining engineering topic, such as gold mine plans or haul trucks."
  - Build all result content with `textContent`, not `innerHTML`.

- [ ] **Step 3: Create `styles.css`** with colors defined as `:root` variables, distinct PDF, Word and Excel colors, a single-column layout that has no sideways scroll at 375px wide, and visible keyboard focus styles. Use a clean, professional look that suits an engineering consultancy.

- [ ] **Step 4: Check the page in a browser**

Serve the folder with a local static server and open it in the browser pane. Confirm at desktop width and at 375px:
  - The main example shows "We found 15 relevant files" with 15 cards.
  - The other two examples show results, with "Best match" on the first card.
  - A typed question works, the unrelated-question hint appears, and empty input does nothing.
  - A second question during the progress steps shows only the second result.
  - The search box and examples work with the keyboard alone.
  - The browser console shows no errors.

---

### Task 3: Prepare for publishing

**Files:**
- Create: `README.md`, `.gitignore`

**Interfaces:**
- Consumes: the finished site from Tasks 1 and 2

- [ ] **Step 1: Create `.gitignore`** containing `node_modules/` and `.vercel/`.

- [ ] **Step 2: Create `README.md`** stating that this is a simulated prototype with made-up data, plus how to run the tests and how to import the repository in Vercel (framework preset "Other", no build command).

- [ ] **Step 3: Run the tests a final time**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 4: Ask the user to confirm publishing.** Only after they confirm, initialize git, commit, create the GitHub repository and push. The user then imports the repository through Vercel's website, and the live URL gets the Task 2 browser checks.

---

### Task 4: Recorded demo

**Files:**
- Create: `docs/demo-script.md`

**Interfaces:**
- Consumes: the live Vercel URL from Task 3

- [ ] **Step 1: Write `docs/demo-script.md`** as a table of scenes with what happens on screen, how long it holds, and a suggested line for the user to say. Scenes: the start screen and prototype label, the main gold question, scrolling through the 15 files, a haul truck question with a different year range, and a closing view.

- [ ] **Step 2: Rehearse with the user.** Run the scenes in the browser pane with `browser_batch`, using `wait` actions for the pauses. Confirm the pacing and the order with the user, and adjust the script.

- [ ] **Step 3: Record.** The user starts their own screen recorder with their microphone on and says when they're ready. Run the whole demo as one batch, so it needs no typed cues during the recording. The user stops the recording and reviews it. Claude does not record the screen or audio.
