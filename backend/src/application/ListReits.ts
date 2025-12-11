import { ReitSnapshot } from '../domain/ReitSnapshot'
import { ReitSnapshotRepository } from '../domain/ReitSnapshotRepository'

/**
 * Query parameters for the ListReits use case.
 * Additional filters (search, ranges, etc.) can be added over time.
 */
export interface ListReitsQuery {
  sector?: string
  minDividendYield?: number
  sortBy?: 'ticker' | 'dividendYield' | 'totalReturn1Y'
  order?: 'asc' | 'desc'
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
   *
   * - Always returns a sorted list of REITs.
   * - Applies optional filters (sector, minDividendYield).
   * - Allows optional sorting by ticker, dividend yield, or 1Y total return.
   */
  async execute(options?: ListReitsQuery): Promise<ReitSnapshot[]> {
    let result = await this._repository.findAll()

    // Apply optional filtering
    if (options?.sector) {
      result = result.filter((r) => r.sector === options.sector)
    }

    if (options?.minDividendYield !== undefined) {
      result = result.filter(
        (r) => r.dividendYield >= options.minDividendYield!,
      )
    }

    // Apply optional sorting
    if (options?.sortBy) {
      const direction = options.order === 'desc' ? -1 : 1

      if (options.sortBy === 'ticker') {
        result = [...result].sort(
          (a, b) => a.ticker.localeCompare(b.ticker) * direction,
        )
      } else if (options.sortBy === 'dividendYield') {
        result = [...result].sort(
          (a, b) => (a.dividendYield - b.dividendYield) * direction,
        )
      } else if (options.sortBy === 'totalReturn1Y') {
        result = [...result].sort(
          (a, b) => (a.totalReturn1Y - b.totalReturn1Y) * direction,
        )
      }
    } else {
      // Default sort: ticker ascending
      result = [...result].sort((a, b) => a.ticker.localeCompare(b.ticker))
    }

    return result
  }
}
