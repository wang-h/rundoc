import Database from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import type { Database as DB } from './types.js'
import path from 'path'

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'rundoc.db')

const sqliteDb = new Database(DB_PATH)
sqliteDb.pragma('journal_mode = WAL')
sqliteDb.pragma('foreign_keys = ON')

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
})
