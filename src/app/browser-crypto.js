import { sha256 } from '@noble/hashes/sha2.js';
// Only the engine's content-version SHA-256 operation is used in the browser preview.
export function createHash(algorithm){if(algorithm!=='sha256')throw new Error('Unsupported hash.');let value='';const api={update(text){value+=text;return api;},digest(format){if(format!=='hex')throw new Error('Use hex output.');return Array.from(sha256(new TextEncoder().encode(value)),b=>b.toString(16).padStart(2,'0')).join('');}};return api;}
