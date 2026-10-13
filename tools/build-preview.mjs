import { build } from 'esbuild';
import { mkdir,rm,readFile,writeFile,copyFile,stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),output=path.join(root,'dist');
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
const copy=async(relative)=>{const destination=path.join(output,relative);await mkdir(path.dirname(destination),{recursive:true});await copyFile(path.join(root,relative),destination);};
// Explicit public-file manifest. Never copy the checkout, database, corpora, credentials or backend.
const files=[
 'src/app/app.css','src/styles.css','src/buildpass.css','src/buildpass-prelude.js','src/main.js','src/v57-hearthlands-geography.js','src/natalie-cosmos.js','src/natalie-cosmos.css','src/territory-cosmos.js','src/territory-cosmos.css','src/world-runtime-config.js',
 'assets/cosmos/original-cosmic.avif','assets/world-equirectangular.png','assets/hearthlands-flatmap.png',
 ...['hearthlands','roadlands','littoral','institutional','river'].map(n=>`assets/territory-planets/${n}-final.png`),
 ...[0,1,2,3].map(i=>`assets/generated/cosmic-0${i}.b64`),
];
for(const relative of files)await copy(relative);
let html=await readFile(path.join(root,'index.html'),'utf8');html=html.replace('<html lang="en">','<html lang="en" data-preview="demo">').replace('Dreamscape — Your inner cosmos','Dreamscape — Demonstration preview');await writeFile(path.join(output,'index.html'),html);
let reference=await readFile(path.join(root,'dream-world-reference.html'),'utf8');
// The shared parent supplies atmosphere. Public demonstration never loads legacy symbol data/audio.
reference=reference.replace('    <link rel="stylesheet" href="/src/hearthlands-symbols.css" />','').replace('        if (!new URLSearchParams(location.search).has("embedded")) await import("/src/cosmos-ambience.js");','').replace('The Dream Atlas could not start.','The reference world could not start.');
await writeFile(path.join(output,'dream-world-reference.html'),reference);
const blueprint=JSON.parse(await readFile(path.join(root,'worlds/natalie-world.json'),'utf8'));delete blueprint.subject;blueprint.id='demonstration-function-worlds';blueprint.title='Dream-function reference worlds';await mkdir(path.join(output,'worlds'),{recursive:true});await writeFile(path.join(output,'worlds/natalie-world.json'),JSON.stringify(blueprint));
// Keep approved artwork and spatial controls; remove source-specific names/counts from public samples.
for(const relative of ['src/main.js','src/v57-hearthlands-geography.js','src/world-runtime-config.js']){
 let source=await readFile(path.join(output,relative),'utf8');source=source.replaceAll('Cambridge Road Childhood House','Childhood House').replaceAll('213 dreams','Reference artwork').replaceAll('362 dreams','Reference artwork');
 if(relative==='src/world-runtime-config.js')source=source.replace('totalDreams:362','totalDreams:null').replace('hearthlands:213','hearthlands:null');
 if(relative==='src/v57-hearthlands-geography.js')source=source.replace(/dreams: \d+/g,'dreams: 0').replace(/button.title = .*?;/s,"button.title = 'Demonstration map location';").replace(/placeSheet.querySelector\('p:last-of-type'\).textContent = place.rare[\s\S]*?;/,"placeSheet.querySelector('p:last-of-type').textContent = 'Reference artwork location. This public preview includes no private source-dream records for this map.';");
 await writeFile(path.join(output,relative),source);
}
await mkdir(path.join(output,'vendor'),{recursive:true});for(const name of ['three.module.js','three.core.js'])await copyFile(path.join(root,'node_modules/three/build',name),path.join(output,'vendor',name));
await build({entryPoints:[path.join(root,'src/app/app.js')],outfile:path.join(output,'src/app/app.js'),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,sourcemap:false,legalComments:'none',plugins:[{name:'preview-content-hash',setup(builder){builder.onResolve({filter:/^node:crypto$/},()=>({path:path.join(root,'src/app/browser-crypto.js')}));}}]});
await writeFile(path.join(output,'robots.txt'),'User-agent: *\nDisallow: /\n');
const forbidden=['server.js','backend','corpora','.git','.env','package.json','.dreamscape-data'];for(const name of forbidden){try{await stat(path.join(output,name));throw new Error('Forbidden public file: '+name);}catch(e){if(e.code!=='ENOENT')throw e;}}
console.log(`Public demonstration build prepared: ${files.length} explicitly allowed assets, fictional journal fixtures, no account backend or credentials.`);
