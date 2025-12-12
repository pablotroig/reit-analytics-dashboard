/**
 * Use case: Compute the intrinsic fair value of a REIT using the
 * Gordon Growth Dividend Discount Model (DDM).
 *
 * Financial model:
 *   D1 = DPS_current * (1 + g)
 *   FairValue = D1 / (r - g)
 *
 * Where:
 *   - DPS_current    = current_price * dividend_yield
 *   - r (discountRate) and g (growthRate) are decimals (0.08 = 8%)
 *
 * Requirements:
 *   - REIT must exist in the snapshot repository.
 *   - REIT must have at least one historical price entry.
 *   - discountRate must be greater than growthRate.
 *
 * Returned fields include:
 *   - current price
 *   - dividend per share
 *   - fair value estimate
 *   - margin of safety (percentage ± relative to market price)
 */

import { ReitSnapshotRepository } from '../domain/ReitSnapshotRepository'
import { ReitHistoryRepository } from '../domain/ReitHistoryRepository'

export interface ReitValuationInput {
  ticker: string
  discountRate: number // Required return (r), decimal (e.g. 0.08 = 8%)
  growthRate: number // Expected dividend growth (g), decimal
}

export interface ReitValuationResult {
  ticker: string
  model: 'DDM'
  currentPrice: number
  dividendPerShare: number
  discountRate: number
  growthRate: number
  fairValue: number
  marginOfSafetyPct: number
}

export class GetReitValuation {
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
   * Execute the valuation using DDM.
   *
   * @throws Error if REIT does not exist, no price history exists,
   *         or discount/growth rates are invalid.
   */
  async execute(input: ReitValuationInput): Promise<ReitValuationResult> {
    const { ticker, discountRate, growthRate } = input

    // Basic validation of financial assumptions
    if (discountRate <= 0 || discountRate <= growthRate) {
      throw new Error('Invalid discount or growth rate')
    }

    // Lookup REIT fundamentals
    const snapshot = await this.snapshotRepo.findByTicker(ticker)
    if (!snapshot) {
      throw new Error('REIT not found')
    }

    // Lookup price history for current price reference
    const history = await this.historyRepo.findByTicker(ticker)
    if (!history || history.length === 0) {
      throw new Error('No price history for valuation')
    }

    // Most recent price (history is already sorted ascending)
    const currentPrice = history[history.length - 1].price

    // Convert dividend yield (%) into dividend per share (DPS)
    const dividendPerShare = currentPrice * (snapshot.dividendYield / 100)

    // Next year's dividend (D1)
    const dividendNext = dividendPerShare * (1 + growthRate)

    // Gordon Growth Model (DDM)
    const fairValue = dividendNext / (discountRate - growthRate)

    // Percentage difference between intrinsic value and market price
    const marginOfSafetyPct =
      currentPrice === 0
        ? 0
        : ((fairValue - currentPrice) / currentPrice) * 100

    return {
      ticker,
      model: 'DDM',
      currentPrice,
      dividendPerShare,
      discountRate,
      growthRate,
      fairValue,
      marginOfSafetyPct,
    }
  }
}
