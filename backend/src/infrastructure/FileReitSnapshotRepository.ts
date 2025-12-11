import { readFileSync } from 'fs'
import path from 'path'
import { ReitSnapshot } from '../domain/ReitSnapshot'
import { ReitSnapshotRepository } from '../domain/ReitSnapshotRepository'

/**
 * Repository implementation that loads REIT snapshots
 * from a JSON file on disk and serves them from memory.
 *
 * This is a simple way to work with a realistic dataset
 * without needing a real database yet.
 */
export class FileReitSnapshotRepository implements ReitSnapshotRepository {
  private readonly snapshots: ReitSnapshot[]

  /**
   * @param filePath path to a JSON file containing an array of ReitSnapshot objects
   */
  constructor(filePath: string) {
    const resolvedPath = path.resolve(filePath)

    const fileContents = readFileSync(resolvedPath, 'utf-8')
    const raw = JSON.parse(fileContents) as ReitSnapshot[]

    // Basic normalization so we know the objects match our domain type shape
    this.snapshots = raw.map((item) => ({
      ticker: item.ticker,
      name: item.name,
      sector: item.sector,
      dividendYield: item.dividendYield,
      totalReturn1Y: item.totalReturn1Y,
    }))
  }

  /**
   * Returns a copy of all REIT snapshots.
   */
  async findAll(): Promise<ReitSnapshot[]> {
    return [...this.snapshots]
  }

  /**
   * Finds a REIT by ticker (case-insensitive).
   */
  async findByTicker(ticker: string): Promise<ReitSnapshot | null> {
    const found = this.snapshots.find(
      (s) => s.ticker.toUpperCase() === ticker.toUpperCase(),
    )
    return found ? { ...found } : null
  }
}
