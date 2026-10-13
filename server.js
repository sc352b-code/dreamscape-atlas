import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8", ".webmanifest":"application/manifest+json", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp", ".avif":"image/avif" };

http.createServer((req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let clean;
  try { clean = decodeURIComponent((req.url || "/").split("?")[0]); }
  catch { res.writeHead(400); res.end("Invalid path"); return; }
  const publicRootFiles = new Set(["/index.html", "/sw.js", "/manifest.webmanifest"]);
  if (clean.split("/").some(segment => segment.startsWith(".") || segment.includes("\\")) || !(clean === "/" || clean === "/sample-corpus.json" || publicRootFiles.has(clean) || ["/src/", "/assets/", "/worlds/"].some(prefix => clean.startsWith(prefix)))) { res.writeHead(404); res.end("Not found"); return; }
  const relative = clean === "/" ? "index.html" : clean === "/sample-corpus.json" ? "corpora/reference-corpus.json" : clean.replace(/^\/+/, "");
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) { res.writeHead(403); res.end("Forbidden"); return; }
  fs.readFile(target, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, { "Content-Type": types[path.extname(target)] || "application/octet-stream", "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff", "Referrer-Policy":"same-origin", "Content-Security-Policy":"default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self' https://cdn.jsdelivr.net; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" });
    res.end(req.method === "HEAD" ? undefined : data);
  });
}).listen(port, "0.0.0.0", () => console.log(`Dreamscape Atlas: http://localhost:${port}`));
