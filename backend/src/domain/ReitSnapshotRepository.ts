import { ReitSnapshot } from './ReitSnapshot'

/**
 * Abstraction over how REIT snapshots are stored and retrieved.
 * Implementations can use in-memory arrays, databases, files, or APIs.
 */
export interface ReitSnapshotRepository {
  /**
   * Returns all REIT snapshots available in the data source.
   */
  findAll(): Promise<ReitSnapshot[]>

  /**
   * Finds a single REIT snapshot by its ticker symbol.
   * Returns null when no matching REIT exists.
   */
  findByTicker(ticker: string): Promise<ReitSnapshot | null>
}
