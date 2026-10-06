const API="https://api.firestorage.ai/dev/file";
const SHARE="n6Ifd8vxttgh";
const FILES={
  master:"natalie_atlas_q70.webp",
  luminous:"a_wide_panoramic_fantasy_sci_fi_landscape_scene.png",
  "direct-message":"a_wide_panoramic_fantasy_landscape_scene_ultra_de.png",
  otherworldly:"a_wide_panoramic_high_detail_fantasy_landscape_s.png",
  threshold:"ultra_wide_fantasy_landscape_panorama_a_richly_de.png",
  integration:"ultra_wide_panoramic_fantasy_landscape_illustratio.png"
};

export default async function handler(req,res){
  try{
    const key=String(req.query.key||"master");
    const name=FILES[key];
    if(!name){res.status(404).send("Unknown asset");return;}
    const list=await fetch(API+"/shares/"+SHARE+"/files?maxResults=1000",{cache:"no-store"});
    if(!list.ok) throw new Error("asset list failed");
    const data=await list.json();
    const file=(data.files||[]).find(f=>f.fileName===name);
    if(!file) throw new Error("asset not found: "+name);
    const dl=await fetch(API+"/shares/"+SHARE+"/files/"+file.fileId+"/download",{method:"POST"});
    if(!dl.ok) throw new Error("download token failed");
    const d=await dl.json();
    const img=await fetch(d.downloadUrl,{cache:"no-store"});
    if(!img.ok) throw new Error("image fetch failed");
    const type=img.headers.get("content-type")||"image/png";
    const buf=Buffer.from(await img.arrayBuffer());
    res.setHeader("Content-Type",type);
    res.setHeader("Cache-Control","public, max-age=300, s-maxage=1800, stale-while-revalidate=86400");
    res.status(200).send(buf);
  }catch(err){
    res.status(500).json({error:String(err&&err.message||err)});
  }
}