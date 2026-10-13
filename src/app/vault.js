// Local encrypted storage, not a remote account/authentication system.
const encoder = new TextEncoder(), decoder = new TextDecoder();
const toBase64 = bytes => btoa(String.fromCharCode(...bytes));
const fromBase64 = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
export async function deriveKey(passphrase, salt) {
  if (passphrase.length < 12) throw new Error('Use a passphrase of at least 12 characters.');
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function encrypt(data, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data)));
  // Encode in chunks: narratives can exceed the argument limit for a single spread.
  let binary = ''; const bytes = new Uint8Array(ciphertext);
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return { iv: toBase64(iv), ciphertext: btoa(binary) };
}
export async function decrypt(envelope, key) {
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(envelope.iv) }, key, fromBase64(envelope.ciphertext));
  return JSON.parse(decoder.decode(plaintext));
}
export function blankData() { return { schema: 1, dreams: [], waking: [], readings: [], favourites: [], associations: {}, drafts: {}, revision: 0 }; }
function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('dreamscape-encrypted-vault', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('vault');
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}
async function transaction(mode, action) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('vault', mode); let result;
    const request = action(tx.objectStore('vault'));
    request.onsuccess = () => { result = request.result; };
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('Could not save local storage.')); };
  });
}
export const storedVault = () => transaction('readonly', store => store.get('personal'));
export const deleteVault = () => transaction('readwrite', store => store.delete('personal'));
export async function createVault(passphrase) {
  if (await storedVault()) throw new Error('A vault already exists. Unlock it instead.');
  const salt = crypto.getRandomValues(new Uint8Array(16)); const key = await deriveKey(passphrase, salt); const data = blankData();
  const envelope = { salt: toBase64(salt), ...await encrypt(data, key), revision: 0 };
  // Check existence in the write transaction too, so simultaneous tabs cannot overwrite a vault.
  const db = await database();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('vault', 'readwrite'), store = tx.objectStore('vault');
    const read = store.get('personal');
    read.onsuccess = () => { if (read.result) tx.abort(); else store.put(envelope, 'personal'); };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = tx.onerror = () => { db.close(); reject(new Error('Could not create vault; another tab may already have created it.')); };
  });
  return { key, data, salt: envelope.salt };
}
export async function unlockVault(passphrase) {
  const saved = await storedVault(); if (!saved) throw new Error('No local vault found.');
  const key = await deriveKey(passphrase, fromBase64(saved.salt));
  try { return { key, salt: saved.salt, data: await decrypt(saved, key) }; }
  catch { throw new Error('This passphrase could not unlock the journal. Your saved data has not changed.'); }
}
export async function saveVault(data, session) {
  const previousRevision = data.revision; const next = { ...data, revision: previousRevision + 1 };
  const envelope = { salt: session.salt, ...await encrypt(next, session.key), revision: next.revision };
  const db = await database();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('vault', 'readwrite'), store = tx.objectStore('vault'); const request = store.get('personal');
    request.onsuccess = () => {
      if (!request.result || request.result.revision !== previousRevision) tx.abort();
      else store.put(envelope, 'personal');
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = tx.onerror = () => { db.close(); reject(new Error('The journal changed in another tab, or storage failed. Export unsaved work before reloading.')); };
  });
  data.revision = next.revision;
}
