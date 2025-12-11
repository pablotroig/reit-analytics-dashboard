import { createApp } from './api/createApp'
import { InMemoryReitSnapshotRepository } from './infrastructure/InMemoryReitSnapshotRepository'
import { ReitSnapshot } from './domain/ReitSnapshot'

/**
 * Provides some sample REIT data so the API returns
 * useful values when running the server locally.
 *
 * Later, this can be replaced with a repository that
 * loads data from a database or external file.
 */
function createInitialSnapshots(): ReitSnapshot[] {
  return [
    {
      ticker: 'PLD',
      name: 'Prologis',
      sector: 'Industrial',
      dividendYield: 2.5,
      totalReturn1Y: 8.1,
    },
    {
      ticker: 'O',
      name: 'Realty Income',
      sector: 'Retail',
      dividendYield: 5.0,
      totalReturn1Y: 3.2,
    },
    {
      ticker: 'AMT',
      name: 'American Tower',
      sector: 'Infrastructure',
      dividendYield: 2.0,
      totalReturn1Y: 6.4,
    },
  ]
}

/**
 * Entry point for running the HTTP server.
 * Creates the repository, builds the Express app,
 * and starts listening on the configured port.
 */
async function main() {
  const snapshots = createInitialSnapshots()
  const repository = new InMemoryReitSnapshotRepository(snapshots)
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
