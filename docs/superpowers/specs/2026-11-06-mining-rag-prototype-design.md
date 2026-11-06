# Mining Engineering RAG Prototype: Design

Date: 2026-11-06
Status: awaiting review

## Purpose

A clickable website prototype that demonstrates how a RAG-style document assistant for a mining engineering consultancy would work. A person types a request, sees a short search animation, then gets a written answer and a list of relevant source files.

Success means someone watching the demo understands the concept: ask in plain language, get an answer, and see which files it came from.

## Not in scope

- Real AI, embeddings, an API key or a server. Search and answers are simulated.
- Real documents. All files, passages and site names are made up.
- Opening, previewing or downloading files. Results are listings only.
- User accounts, file uploads and saved history.

## What people see

1. **Start screen:** page title, a visible "Prototype: simulated answers" label, a search box and three clickable example questions:
   - "Can you find me the gold mining report from 2015 to 2017?"
   - "Show me haul truck studies from 2016 to 2018"
   - "Find the tailings engineering reports"
2. **Progress:** about 1.5 seconds of steps: "Searching documents", "Found relevant sources", "Writing answer". With reduced-motion turned on, the steps appear without animation.
3. **Answer:** a heading such as "We found 15 relevant files", followed by a one-sentence summary naming the years and the topics covered.
4. **Sources:** one card per file showing the file name, type icon (PDF, Word or Excel, each with its own color), category, year and a short passage explaining the match. The first card is marked "Best match".

If nothing matches, the page shows a short hint: "Try asking about a mining engineering topic, such as gold mine plans or haul trucks." This case is not featured in the example questions.

The layout works at desktop and phone widths, and the search box and example questions work by keyboard.

## Sample library

48 fake files, 6 in each category, with file types spread across PDF, Word and Excel:

- Gold Mining Plan
- Haul Truck
- Mine Design & Scheduling
- Geotechnical Engineering
- Drill & Blast
- Processing Plant Engineering
- Tailings Engineering
- Equipment & Maintenance

Each file record has: `name`, `type` (`pdf`, `docx` or `xlsx`), `category`, `year`, `commodity`, `site` (fictional) and `passage`. Years run from 2013 to 2020 so that year ranges change the results.

Exactly 15 files have the commodity `gold` and a year from 2015 to 2017, so the main example returns 15. A test enforces this.

## Search behavior

Search is a pure function, `search(question, files)`, that returns `{ files, summary }`.

1. **Year range:** reads "from 2015 to 2017", "2015-2017" and "between 2015 and 2017" as a range, and a single year such as "in 2016" as that year only. With no year in the question, all years are included.
2. **Topic words:** lowercases the question, then removes the years, common words (such as "can", "you", "find", "me", "the") and generic words ("report", "reports", "file", "files", "study", "studies", "mining", "mine", "engineering").
3. **Matching:** a file matches if it is within the year range and at least one topic word appears as a whole word in its name, category, commodity, site or passage. A trailing "s" is ignored on both sides, so "trucks" matches "truck". If the question has a year range and no topic words, every file in that range matches. If it has neither, nothing matches.
4. **Ranking:** a topic word in the name or category scores higher than one in the other fields. Ties go to the more recent year, then alphabetically by name.

The count and summary always come from the actual results. They are never hardcoded.

## Prepared client answers

Some questions get a written answer in place of a file count. These answers are written in advance in `data.js`. Each one lists its key words and source files, and it is used when the question contains all of its key words and all of its source files exist. Other questions use the normal search.

The demo's example is "Our client wants to know which haul truck fleet can meet the production target at Tarn Basin." Its answer is a fleet of 14 trucks with a 136-tonne payload, sourced from `Haul_Truck_Fleet_Sizing_2015.xlsx`.

## How it's built

Plain HTML, CSS and JavaScript modules, with no framework, runtime dependencies or build step:

| File | Job |
|---|---|
| `index.html` | Page structure |
| `styles.css` | Styling and responsive layout |
| `data.js` | The 48 sample files |
| `search.js` | Year parsing, matching, ranking and the summary, with no page code |
| `app.js` | Connects the page to search and runs the progress steps |
| `tests/search.test.js` | Automated tests, run with Node's built-in test runner |
| `package.json` | Marks the code as JavaScript modules and defines the test command, with no dependencies |

## Testing

Automated tests cover:

- The main gold example returns exactly 15 files, all gold and all from 2015 to 2017.
- Each of the three example questions returns at least one file.
- The library has 48 files, 6 per category, and all three file types.
- Each year format is read correctly, and a single year works.
- The results and summary change when the year range changes.
- A question with no matching topic returns no files.
- The ranking puts name and category matches first.

Manual browser check at desktop and phone widths: all three example questions, typed questions, the no-match hint and keyboard use.

## Publishing

Code goes to a new GitHub repository, then the user imports that repository through Vercel's website. Nothing is pushed until the user confirms. The GitHub and Vercel command-line tools are not installed and aren't required for the Vercel import.

## Recorded demo

After the site is live, the user makes a video of it. Claude controls the site in the browser pane, following a rehearsed script with set pauses. The user runs their own screen recorder and narrates with their own voice. Claude does not capture the screen or audio.
