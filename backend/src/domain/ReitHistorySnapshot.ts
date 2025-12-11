/**
 * Represents one historical data point for a REIT.
 * Used for time-series analysis (price over time).
 */
export interface ReitHistorySnapshot {
  /** ISO date string representing the point in time (e.g., '2024-01-01') */
  date: string

  /** Closing price of the REIT on the given date */
  price: number
}
