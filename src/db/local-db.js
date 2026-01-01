import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Get data directory - use executable directory for .exe, or project root for dev
function getDataDir() {
  const exeDir = process.pkg ? path.dirname(process.execPath) : process.cwd()
  const dataDir = path.join(exeDir, 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  return dataDir
}

const dataDir = getDataDir()
const dbPath = path.join(dataDir, 'shortener.db')

export const db = new Database(dbPath)

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS short_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    default_url TEXT NOT NULL,
    og_title TEXT,
    og_description TEXT,
    og_image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS short_link_destinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_link_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    weight INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (short_link_id) REFERENCES short_links(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS short_link_counters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_link_id INTEGER UNIQUE NOT NULL,
    total_clicks INTEGER DEFAULT 0,
    android_clicks INTEGER DEFAULT 0,
    ios_clicks INTEGER DEFAULT 0,
    desktop_clicks INTEGER DEFAULT 0,
    FOREIGN KEY (short_link_id) REFERENCES short_links(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS short_link_click_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_link_id INTEGER NOT NULL,
    slug TEXT,
    device TEXT,
    referrer TEXT,
    ua TEXT,
    ip_hash TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (short_link_id) REFERENCES short_links(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS app_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

// Get images directory
export function getImagesDir() {
  const imagesDir = path.join(dataDir, 'images')
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
  }
  return imagesDir
}

export { dataDir }
