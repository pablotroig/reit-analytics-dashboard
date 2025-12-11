import { ReitSnapshotRepository } from '../domain/ReitSnapshotRepository'
import { ReitHistoryRepository } from '../domain/ReitHistoryRepository'
import { ReitHistorySnapshot } from '../domain/ReitHistorySnapshot'

/**
 * Retrieves historical price data for a given REIT.
 * Ensures the REIT exists and that history is available.
 */
export class GetReitHistory {
  private readonly snapshotRepo: ReitSnapshotRepository
  private readonly historyRepo: ReitHistoryRepository

  constructor(
    snapshotRepo: ReitSnapshotRepository,
    historyRepo: ReitHistoryRepository
  ) {
    this.snapshotRepo = snapshotRepo
    this.historyRepo = historyRepo
  }

  /**
   * Returns sorted historical data for the REIT.
   * @throws 'REIT not found' if ticker does not exist
   * @throws 'No history available' if no historical data exists
   */
  async execute(ticker: string): Promise<ReitHistorySnapshot[]> {
    const snapshot = await this.snapshotRepo.findByTicker(ticker)
    if (!snapshot) {
      throw new Error('REIT not found')
    }

    const history = await this.historyRepo.findByTicker(ticker)
    if (!history) {
      throw new Error('No history available')
    }

    return history
  }
}
