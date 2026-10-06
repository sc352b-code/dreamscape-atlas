const API="https://api.firestorage.ai/dev/file";
const SHARE="gL-kR5zl85F_";
const FILES={integration:"integration_healing_living_composite.mp4"};

export default async function handler(req,res){
  try{
    const key=String(req.query.key||"integration");
    const name=FILES[key];
    if(!name){res.status(404).send("Unknown motion asset");return;}
    const list=await fetch(API+"/shares/"+SHARE+"/files?maxResults=1000",{cache:"no-store"});
    if(!list.ok)throw new Error("motion asset list failed");
    const data=await list.json();
    const file=(data.files||[]).find(f=>f.fileName===name);
    if(!file)throw new Error("motion asset not found");
    const dl=await fetch(API+"/shares/"+SHARE+"/files/"+file.fileId+"/download",{method:"POST"});
    if(!dl.ok)throw new Error("motion download token failed");
    const d=await dl.json();
    const vid=await fetch(d.downloadUrl,{cache:"no-store"});
    if(!vid.ok)throw new Error("motion fetch failed");
    const buf=Buffer.from(await vid.arrayBuffer());
    res.setHeader("Content-Type",vid.headers.get("content-type")||"video/mp4");
    res.setHeader("Cache-Control","public, max-age=300, s-maxage=1800, stale-while-revalidate=86400");
    res.setHeader("Content-Length",String(buf.length));
    res.status(200).send(buf);
  }catch(err){
    res.status(500).json({error:String(err&&err.message||err)});
  }
}