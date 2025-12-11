import { ReitHistorySnapshot } from './ReitHistorySnapshot'

/**
 * Repository interface for retrieving historical price series for a REIT.
 * Returns null when no history exists for the given ticker.
 */
export interface ReitHistoryRepository {
  /**
   * Fetches the full chronological history for the specified ticker.
   * @param ticker - The REIT ticker symbol (e.g., 'O', 'PLD').
   * @returns Array of history snapshots sorted by date, or null if not found.
   */
  findByTicker(ticker: string): Promise<ReitHistorySnapshot[] | null>
}
