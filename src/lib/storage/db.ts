import { openDB, type IDBPDatabase } from 'idb'
import type { Session } from '@/types/session'
import type { AppSettings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

const DB_NAME = 'face-habit-viewer'
const DB_VERSION = 1
const SESSIONS_STORE = 'sessions'
const SETTINGS_STORE = 'settings'
const SETTINGS_KEY = 'singleton'

type SettingsRow = AppSettings & { id: string }

export type DbSchema = {
  [SESSIONS_STORE]: { key: string; value: Session }
  [SETTINGS_STORE]: { key: string; value: SettingsRow }
}

let dbPromise: Promise<IDBPDatabase<DbSchema>> | null = null

export function getDB(): Promise<IDBPDatabase<DbSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<DbSchema>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        database.createObjectStore(SESSIONS_STORE, { keyPath: 'id' })
        database.createObjectStore(SETTINGS_STORE, { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function saveSession(session: Session): Promise<void> {
  const db = await getDB()
  await db.put(SESSIONS_STORE, session)
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDB()
  return db.get(SESSIONS_STORE, id)
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDB()
  const list = await db.getAll(SESSIONS_STORE)
  return list.sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime())
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(SESSIONS_STORE, id)
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  const row = await db.get(SETTINGS_STORE, SETTINGS_KEY)
  if (!row) return DEFAULT_SETTINGS
  const { id: _id, ...rest } = row
  return rest
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB()
  await db.put(SETTINGS_STORE, { id: SETTINGS_KEY, ...settings })
}
