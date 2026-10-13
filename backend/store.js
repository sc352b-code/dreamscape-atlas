import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
export function openStore(file) {
  mkdirSync(dirname(file),{recursive:true,mode:0o700});const db=new DatabaseSync(file);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS entries(id TEXT NOT NULL,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,kind TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(user_id,id));
    CREATE TABLE IF NOT EXISTS readings(id TEXT NOT NULL,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,data TEXT NOT NULL,PRIMARY KEY(user_id,id));
    CREATE TABLE IF NOT EXISTS favourites(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,kind TEXT NOT NULL,id TEXT NOT NULL,PRIMARY KEY(user_id,kind,id));`);
  const all=(table,user)=>db.prepare(`SELECT data FROM ${table} WHERE user_id=?`).all(user).map(row=>JSON.parse(row.data));
  return {db,entries:user=>all('entries',user).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id)),readings:user=>all('readings',user).sort((a,b)=>a.created.localeCompare(b.created)||a.id.localeCompare(b.id)),
    entry:(user,id)=>{const row=db.prepare('SELECT data FROM entries WHERE user_id=? AND id=?').get(user,id);return row&&JSON.parse(row.data);},
    saveEntry:(user,data)=>db.prepare('INSERT INTO entries(id,user_id,kind,data) VALUES(?,?,?,?) ON CONFLICT(user_id,id) DO UPDATE SET kind=excluded.kind,data=excluded.data').run(data.id,user,data.kind,JSON.stringify(data)),
    saveReading:(user,data)=>db.prepare('INSERT INTO readings(id,user_id,data) VALUES(?,?,?)').run(data.id,user,JSON.stringify(data)),
    favourites:user=>db.prepare('SELECT kind,id FROM favourites WHERE user_id=?').all(user),close:()=>db.close()};
}
