import { ReitSnapshot } from '../domain/ReitSnapshot'
import { ReitSnapshotRepository } from '../domain/ReitSnapshotRepository'

/**
 * Query parameters for the ListReits use case.
 * Additional filters (minDividendYield, search, etc.)
 * will be added as the feature set grows.
 */
export interface ListReitsQuery {
  sector?: string
  minDividendYield?: number
}

/**
 * Use case for listing REIT snapshots for the overview screen.
 * Retrieves all snapshots from the repository, applies optional
 * filtering, and returns them in a deterministic sorted order.
 */
export class ListReits {
  private readonly _repository: ReitSnapshotRepository

  /**
   * Creates a ListReits use case with a repository dependency.
   * @param repository an implementation of ReitSnapshotRepository
   */
  constructor(repository: ReitSnapshotRepository) {
    this._repository = repository
  }

  /**
   * Executes the use case.
   * Returns REIT snapshots sorted by ticker.
   * Applies optional filtering when query parameters are provided.
   */
  async execute(query?: ListReitsQuery): Promise<ReitSnapshot[]> {
    const snapshots = await this._repository.findAll()

    let filtered = snapshots

    if (query?.sector) {
      filtered = filtered.filter((s) => s.sector === query.sector)
    }

    if (query?.minDividendYield !== undefined) {
      filtered = filtered.filter(
        (s) => s.dividendYield >= query.minDividendYield!
      )
    }

    return [...filtered].sort((a, b) => a.ticker.localeCompare(b.ticker))
  }
}
