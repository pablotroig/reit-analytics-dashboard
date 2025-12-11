import { ReitHistoryRepository } from '../domain/ReitHistoryRepository'
import { ReitHistorySnapshot } from '../domain/ReitHistorySnapshot'

/**
 * Simple in-memory repository for REIT historical data.
 * The map keys are tickers, each mapping to an array of history snapshots.
 */
export class InMemoryReitHistoryRepository implements ReitHistoryRepository {
  private readonly history: Record<string, ReitHistorySnapshot[]>

  constructor(history: Record<string, ReitHistorySnapshot[]>) {
    this.history = history
  }

  async findByTicker(ticker: string): Promise<ReitHistorySnapshot[] | null> {
    const data = this.history[ticker]
    if (!data) return null

    // Return a new array sorted by date ascending
    return [...data].sort((a, b) => a.date.localeCompare(b.date))
  }
}
