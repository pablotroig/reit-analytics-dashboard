import path from 'path'
import { createApp } from './api/createApp'
import { FileReitSnapshotRepository } from './infrastructure/FileReitSnapshotRepository'
import { ReitSnapshotRepository } from './domain/ReitSnapshotRepository'

/**
 * Creates the repository that will back the API.
 * For now this loads data from a JSON file on disk.
 */
function createRepository(): ReitSnapshotRepository {
  const dataFilePath = path.join(__dirname, '..', 'data', 'reits.json')
  return new FileReitSnapshotRepository(dataFilePath)
}

/**
 * Bootstraps the HTTP server and starts listening on the configured port.
 */
async function main() {
  const repository = createRepository()
  const app = createApp(repository)

  const port = process.env.PORT ? Number(process.env.PORT) : 3000

  app.listen(port, () => {
    console.log(`REIT backend listening on http://localhost:${port}`)
  })
}

main().catch((err) => {
  console.error('Failed to start server', err)
  process.exit(1)
})
