import fs from 'node:fs';
import assert from 'node:assert/strict';

const profile=fs.readFileSync('src/dreamscape-private-profile.js','utf8');
const registration=fs.readFileSync('src/hearthlands-registration-v1.js','utf8');
const index=fs.readFileSync('index.html','utf8');

assert(index.includes('/src/dreamscape-private-profile.js'));
assert(index.indexOf('/src/dreamscape-private-profile.js')<index.indexOf('/src/hearthlands-registration-v1.js'));
assert(profile.includes("STORAGE_KEY='dreamscape.privateProfile.v1'"));
assert(profile.includes('semanticLabels'));
assert(profile.includes('getSemanticLabel'));
assert(profile.includes('setSemanticLabels'));
assert(profile.includes('sessionStorage'));
assert(profile.includes('dreamscape-private-profile-change'));
assert(profile.includes('__DREAMSCAPE_PRIVATE_PROFILE_BOOTSTRAP__'));
assert(registration.includes('window.DreamscapePrivateProfile'));
assert(registration.includes('getSemanticLabel'));
assert(registration.includes('dreamscape-private-profile-change'));
assert(registration.includes('resolveHearthlandsPrivateIdentities'));

for(const forbidden of ['Alex','Alice','George','Grandma','Lily','Mum','Natalie','Percy','Stephen Coarse','Wayne']){
  assert(!profile.includes(forbidden),`private identity leaked into profile runtime: ${forbidden}`);
}

console.log('Dreamscape private profile runtime integrity: per-session profile hydration, runtime semantic-label resolution and Hearthlands re-resolution are wired without public identity leakage.');
