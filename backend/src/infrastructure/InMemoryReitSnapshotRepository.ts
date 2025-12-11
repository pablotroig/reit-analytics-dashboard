import { ReitSnapshot } from '../domain/ReitSnapshot'
import { ReitSnapshotRepository } from '../domain/ReitSnapshotRepository'

/**
 * In-memory implementation of ReitSnapshotRepository.
 * Intended for tests and simple local scenarios where
 * REIT data is provided as an array at construction time.
 */
export class InMemoryReitSnapshotRepository
  implements ReitSnapshotRepository
{
  private readonly snapshots: ReitSnapshot[]

  /**
   * Creates a new in-memory repository seeded with REIT snapshots.
   * @param initialSnapshots REIT data to expose through the repository
   */
  constructor(initialSnapshots: ReitSnapshot[]) {
    this.snapshots = initialSnapshots
  }

  /**
   * Returns all REIT snapshots in their current order.
   */
  async findAll(): Promise<ReitSnapshot[]> {
    return this.snapshots
  }

  /**
   * Finds a single REIT snapshot by ticker.
   * Returns null when no matching snapshot exists.
   */
  async findByTicker(ticker: string): Promise<ReitSnapshot | null> {
    const match = this.snapshots.find((s) => s.ticker === ticker)
    return match ?? null
  }
}
