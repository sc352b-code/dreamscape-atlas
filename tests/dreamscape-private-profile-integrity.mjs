import fs from 'node:fs';
import assert from 'node:assert/strict';

const profile=fs.readFileSync('src/dreamscape-private-profile.js','utf8');
const registration=fs.readFileSync('src/hearthlands-registration-v1.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const server=fs.readFileSync('server.js','utf8');
const gitignore=fs.readFileSync('.gitignore','utf8');

assert(index.includes('/src/dreamscape-private-profile.js'));
assert(index.indexOf('/src/dreamscape-private-profile.js')<index.indexOf('/src/hearthlands-registration-v1.js'));
assert(!index.includes('</script>\\n    <script type="module" src="/src/hearthlands-territory-v1.js">'));

assert(profile.includes('__DREAMSCAPE_PRIVATE_PROFILE_PROVIDER__'));
assert(profile.includes('hydrateFromProvider'));
assert(profile.includes('loadLocalPreviewProvider'));
assert(profile.includes("fetch('/__private/profile'"));
assert(profile.includes("['localhost','127.0.0.1','::1']"));
assert(profile.includes('getSemanticLabel'));
assert(profile.includes('dreamscape-private-profile-change'));

assert(registration.includes('window.DreamscapePrivateProfile'));
assert(registration.includes('getSemanticLabel'));
assert(registration.includes('resolveHearthlandsPrivateIdentities'));

assert(server.includes('/__private/profile'));
assert(server.includes('DREAMSCAPE_PRIVATE_PREVIEW'));
assert(server.includes('.dreamscape'));
assert(server.includes('isLoopback'));
assert(gitignore.includes('.dreamscape/'));

for(const forbidden of ['Alex','Alice','George','Grandma','Lily','Mum','Natalie','Percy','Stephen Coarse','Wayne']){
  assert(!profile.includes(forbidden));
  assert(!server.includes(forbidden));
}

console.log('Dreamscape private profile runtime integrity: provider seam and localhost-only private preview path are wired without public identity leakage.');
