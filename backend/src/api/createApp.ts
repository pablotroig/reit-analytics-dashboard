import express, { Request, Response } from 'express'
import { ReitSnapshotRepository } from '../domain/ReitSnapshotRepository'
import { ListReits, ListReitsQuery } from '../application/ListReits'
import { GetReitDetails } from '../application/GetReitDetails'

/**
 * Factory for creating an Express application that exposes
 * REIT-related routes backed by the given repository.
 *
 * This keeps the HTTP layer thin and focused on translating
 * HTTP requests into use case calls.
 */
export function createApp(repository: ReitSnapshotRepository) {
  const app = express()

  app.use(express.json())

  const listReits = new ListReits(repository)
  const getReitDetails = new GetReitDetails(repository)

  /**
   * GET /reits
   * Optional query parameters:
   * - sector: filter by REIT sector
   * - minDividendYield: filter by minimum dividend yield (number)
   */
  app.get('/reits', async (req: Request, res: Response) => {
    try {
      const sector =
        typeof req.query.sector === 'string' ? req.query.sector : undefined

      const minDividendYieldRaw =
        typeof req.query.minDividendYield === 'string'
          ? req.query.minDividendYield
          : undefined

      const query: ListReitsQuery = {}

      if (sector) {
        query.sector = sector
      }

      if (minDividendYieldRaw !== undefined) {
        const parsed = Number(minDividendYieldRaw)
        if (!Number.isNaN(parsed)) {
          query.minDividendYield = parsed
        }
      }

      const snapshots = await listReits.execute(query)
      res.json(snapshots)
    } catch (err) {
      // Basic safety net; can be improved with centralized error handling.
      res.status(500).json({ error: 'Unexpected server error' })
    }
  })

  /**
   * GET /reits/:ticker
   * Returns details for a single REIT identified by its ticker.
   */
  app.get('/reits/:ticker', async (req: Request, res: Response) => {
    const ticker = req.params.ticker

    try {
      const snapshot = await getReitDetails.execute(ticker)
      res.json(snapshot)
    } catch (err) {
      if (err instanceof Error && err.message === 'REIT not found') {
        res.status(404).json({ error: 'REIT not found' })
      } else {
        res.status(500).json({ error: 'Unexpected server error' })
      }
    }
  })

  return app
}
