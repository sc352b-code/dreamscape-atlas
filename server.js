import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml" };
const privateProfilePath = path.join(root, ".dreamscape", "private-profile.local.json");

function isLoopback(req){
  const ip=req.socket.remoteAddress||"";
  return ip==="127.0.0.1"||ip==="::1"||ip==="::ffff:127.0.0.1";
}

http.createServer((req, res) => {
  const clean = decodeURIComponent((req.url || "/").split("?")[0]);

  if(clean==="/__private/profile"){
    if(process.env.DREAMSCAPE_PRIVATE_PREVIEW!=="1"||!isLoopback(req)){
      res.writeHead(404,{"Cache-Control":"no-store"}); res.end("Not found"); return;
    }
    fs.readFile(privateProfilePath,(err,data)=>{
      if(err){res.writeHead(404,{"Cache-Control":"no-store"});res.end("Not found");return;}
      res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store, private"});
      res.end(data);
    });
    return;
  }

  const relative = clean === "/" ? "index.html" : clean.replace(/^\/+/, "");
  const target = path.resolve(root, relative);
  if (!target.startsWith(root)) { res.writeHead(403); res.end("Forbidden"); return; }
  fs.readFile(target, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, { "Content-Type": types[path.extname(target)] || "application/octet-stream", "Cache-Control":"no-store" });
    res.end(data);
  });
}).listen(port, "0.0.0.0", () => console.log(`Dreamscape Atlas: http://localhost:${port}`));
