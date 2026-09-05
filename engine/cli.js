import fs from "node:fs";
import path from "node:path";
import { buildWorld } from "./buildWorld.js";

const [, , inFile, outFile] = process.argv;
if (!inFile || !outFile) {
  console.error("Usage: node engine/cli.js <corpus.json> <world.json>");
  process.exit(1);
}

const corpus = JSON.parse(fs.readFileSync(path.resolve(inFile), "utf8"));
const world = buildWorld(corpus);
fs.writeFileSync(path.resolve(outFile), JSON.stringify(world, null, 2) + "\n");
console.log(`Generated ${outFile} from ${inFile}`);
