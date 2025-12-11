import { ReitSnapshot } from '../domain/ReitSnapshot'
import { ReitSnapshotRepository } from '../domain/ReitSnapshotRepository'

/**
 * Use case for retrieving the details of a single REIT by ticker.
 * Intended for driving a REIT detail screen or panel.
 */
export class GetReitDetails {
  private readonly _repository: ReitSnapshotRepository

  /**
   * Creates a GetReitDetails use case with a repository dependency.
   * @param repository an implementation of ReitSnapshotRepository
   */
  constructor(repository: ReitSnapshotRepository) {
    this._repository = repository
  }

  /**
   * Executes the use case.
   * @param ticker the REIT ticker symbol to look up
   * @throws Error when no REIT exists for the given ticker
   */
  async execute(ticker: string): Promise<ReitSnapshot> {
    const snapshot = await this._repository.findByTicker(ticker)

    if (!snapshot) {
      throw new Error('REIT not found')
    }

    return snapshot
  }
}
