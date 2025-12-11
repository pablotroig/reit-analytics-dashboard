/**
 * A read-only snapshot of a REIT's key summary metrics.
 * This represents the data required for overview lists and
 * simple comparisons and does not include time-series history.
 */
export interface ReitSnapshot {
  ticker: string;
  name: string;
  sector: string;
  dividendYield: number;
  totalReturn1Y: number;
}
