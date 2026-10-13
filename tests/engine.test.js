import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildWorld, extractMotifs } from "../engine/buildWorld.js";

const corpus = JSON.parse(fs.readFileSync(new URL("../corpora/reference-corpus.json", import.meta.url), "utf8"));

test("motifs retain corpus evidence", () => {
  const motifs = extractMotifs(corpus);
  const fox = motifs.find(m => m.name === "fox");
  assert.ok(fox);
  assert.equal(fox.recurrence, 2);
  assert.deepEqual(fox.evidence.sort(), ["d1", "d2"]);
});

test("world generation is stable for identity fields", () => {
  const a = buildWorld(corpus);
  const b = buildWorld(corpus);
  assert.ok(a.territories[0].id);
  assert.equal(a.corpusSummary.dreamCount, corpus.dreams.length);
  assert.deepEqual(a, b);
  assert.equal(a.territories[0].id, b.territories[0].id);
});
