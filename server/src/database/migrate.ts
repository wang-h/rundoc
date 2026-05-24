import { Migrator, type Kysely, type Migration } from 'kysely'
import type { Database } from './types.js'

// Manually import all migrations here (avoids ESM file-system issues with FileMigrationProvider)
import { up as m0001_up, down as m0001_down } from './migrations/0001_create_projects.js'
import { up as m0002_up, down as m0002_down } from './migrations/0002_create_documents.js'

const migrations: Record<string, Migration> = {
  '0001_create_projects': { up: m0001_up, down: m0001_down },
  '0002_create_documents': { up: m0002_up, down: m0002_down },
}

export async function migrateToLatest(db: Kysely<Database>): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: {
      async getMigrations() {
        return migrations
      },
    },
  })

  const { error, results } = await migrator.migrateToLatest()

  if (results) {
    for (const it of results) {
      if (it.status === 'Success') {
        console.log(`  ✓ Migration "${it.migrationName}" executed successfully`)
      } else if (it.status === 'Error') {
        console.error(`  ✗ Migration "${it.migrationName}" failed`)
      }
    }
  }

  if (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
