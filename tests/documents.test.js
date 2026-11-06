import { test } from "node:test";
import assert from "node:assert/strict";
import { FILES } from "../data.js";
import { buildDocumentPreview } from "../documents.js";

const byName = (name) => FILES.find((f) => f.name === name);
const PILLAR = byName("Underground_Pillar_Design_2020.pdf");

test("the title comes from the file name", () => {
  assert.equal(buildDocumentPreview(PILLAR).title, "Underground Pillar Design 2020");
});

test("the preview shows the file's details and passage", () => {
  const preview = buildDocumentPreview(PILLAR);
  assert.deepEqual(preview.details, [
    ["File", "Underground_Pillar_Design_2020.pdf"],
    ["Category", "Geotechnical Engineering"],
    ["Year", "2020"],
    ["Company", "Harlow Ridge"],
    ["Commodity", "Copper"],
  ]);
  assert.equal(preview.overview, PILLAR.passage);
});

test("every sample file has a complete preview", () => {
  for (const file of FILES) {
    const { sections, table } = buildDocumentPreview(file);
    assert.ok(sections.length > 0, file.name);
    assert.ok(sections.every((s) => s.heading && s.text), file.name);
    assert.ok(table.rows.length > 0, file.name);
    assert.ok(table.rows.every((row) => row.length === table.headers.length), file.name);
  }
});

test("preview text never adds gold to a non-gold file", () => {
  for (const file of FILES.filter((f) => f.commodity !== "gold")) {
    assert.doesNotMatch(JSON.stringify(buildDocumentPreview(file)), /gold/i, file.name);
  }
});
