import express from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'
import path from 'path'

import { ReitSnapshotRepository } from '../domain/ReitSnapshotRepository'
import { ListReits } from '../application/ListReits'
import { GetReitDetails } from '../application/GetReitDetails'
import { InMemoryReitHistoryRepository } from '../infrastructure/InMemoryReitHistoryRepository'
import { GetReitHistory } from '../application/GetReitHistory'

/**
 * Builds and configures the Express application.
 * Routes are wired to use cases, keeping the API layer thin.
 */
export function createApp(repository: ReitSnapshotRepository) {
  const app = express()
  app.use(cors())
  app.use(express.json())

  // Use case instances
  const listReits = new ListReits(repository)
  const getReitDetails = new GetReitDetails(repository)

  // History repository + use case (loaded from data/history.json)
  let getReitHistory: GetReitHistory | null = null
  try {
    const historyFilePath = path.join(__dirname, '..', '..', 'data', 'history.json')
    const fileContents = readFileSync(historyFilePath, 'utf-8')
    const rawHistory = JSON.parse(fileContents)
    const historyRepository = new InMemoryReitHistoryRepository(rawHistory)
    getReitHistory = new GetReitHistory(repository, historyRepository)
  } catch (err) {
    console.error('Failed to initialize history repository', err)
  }

  /**
   * GET /reits
   * Supports:
   * - sector filtering
   * - minimum dividend yield filtering
   * - optional sorting
   */
  app.get('/reits', async (req, res) => {
    try {
      const { sector, minDividendYield, sortBy, order } = req.query

      const options = {
        sector: sector as string | undefined,
        minDividendYield: minDividendYield
          ? Number(minDividendYield)
          : undefined,
        sortBy: sortBy as
          | 'ticker'
          | 'dividendYield'
          | 'totalReturn1Y'
          | undefined,
        order: order as 'asc' | 'desc' | undefined,
      }

      const data = await listReits.execute(options)
      res.json(data)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to fetch REITs' })
    }
  })

  /**
   * GET /reits/:ticker
   * Returns details for a single REIT.
   * Maps domain "REIT not found" errors to a 404 HTTP response.
   */
  app.get('/reits/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase()
      const details = await getReitDetails.execute(ticker)

      if (!details) {
        return res.status(404).json({ error: 'REIT not found' })
      }

      res.json(details)
    } catch (err) {
      if (err instanceof Error && err.message === 'REIT not found') {
        return res.status(404).json({ error: 'REIT not found' })
      }

      console.error(err)
      res.status(500).json({ error: 'Failed to fetch REIT details' })
    }
  })

  /**
   * GET /reits/:ticker/history
   * Returns historical price data for a REIT.
   */
  app.get('/reits/:ticker/history', async (req, res) => {
    if (!getReitHistory) {
      return res
        .status(500)
        .json({ error: 'History repository not configured' })
    }

    try {
      const ticker = req.params.ticker.toUpperCase()
      const history = await getReitHistory.execute(ticker)
      res.json(history)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'REIT not found') {
          return res.status(404).json({ error: 'REIT not found' })
        }
        if (err.message === 'No history available') {
          return res.status(404).json({ error: 'No history available' })
        }
      }

      console.error(err)
      res.status(500).json({ error: 'Failed to fetch REIT history' })
    }
  })

  return app
}
