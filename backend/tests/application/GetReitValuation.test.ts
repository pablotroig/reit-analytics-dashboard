import { GetReitValuation } from '../../src/application/GetReitValuation'
import { InMemoryReitSnapshotRepository } from '../../src/infrastructure/InMemoryReitSnapshotRepository'
import { InMemoryReitHistoryRepository } from '../../src/infrastructure/InMemoryReitHistoryRepository'
import { ReitSnapshot } from '../../src/domain/ReitSnapshot'

describe('GetReitValuation', () => {
  const snapshots: ReitSnapshot[] = [
    {
      ticker: 'O',
      name: 'Realty Income',
      sector: 'Retail',
      dividendYield: 5,
      totalReturn1Y: 10,
    },
  ]

  const historyData = {
    O: [
      { date: '2024-01-01', price: 50 },
      { date: '2024-02-01', price: 52 },
    ],
  }

  it('computes a DDM fair value and margin of safety', async () => {
    const snapshotRepo = new InMemoryReitSnapshotRepository(snapshots)
    const historyRepo = new InMemoryReitHistoryRepository(historyData)
    const usecase = new GetReitValuation(snapshotRepo, historyRepo)

    const result = await usecase.execute({
      ticker: 'O',
      discountRate: 0.08,
      growthRate: 0.02,
    })

    expect(result.ticker).toBe('O')
    expect(result.model).toBe('DDM')
    expect(result.currentPrice).toBe(52)

    const expectedDividend = 52 * 0.05
    expect(result.dividendPerShare).toBeCloseTo(expectedDividend)

    const expectedFairValue = (expectedDividend * 1.02) / (0.08 - 0.02)
    expect(result.fairValue).toBeCloseTo(expectedFairValue)

    const expectedMos = ((expectedFairValue - 52) / 52) * 100
    expect(result.marginOfSafetyPct).toBeCloseTo(expectedMos)
  })

  it('throws if the REIT does not exist', async () => {
    const snapshotRepo = new InMemoryReitSnapshotRepository([])
    const historyRepo = new InMemoryReitHistoryRepository(historyData)
    const usecase = new GetReitValuation(snapshotRepo, historyRepo)

    await expect(
      usecase.execute({ ticker: 'X', discountRate: 0.08, growthRate: 0.02 })
    ).rejects.toThrow('REIT not found')
  })

  it('throws if there is no history', async () => {
    const snapshotRepo = new InMemoryReitSnapshotRepository(snapshots)
    const historyRepo = new InMemoryReitHistoryRepository({})
    const usecase = new GetReitValuation(snapshotRepo, historyRepo)

    await expect(
      usecase.execute({ ticker: 'O', discountRate: 0.08, growthRate: 0.02 })
    ).rejects.toThrow('No price history for valuation')
  })

  it('throws if discount/growth rates are invalid', async () => {
    const snapshotRepo = new InMemoryReitSnapshotRepository(snapshots)
    const historyRepo = new InMemoryReitHistoryRepository(historyData)
    const usecase = new GetReitValuation(snapshotRepo, historyRepo)

    await expect(
      usecase.execute({ ticker: 'O', discountRate: 0.02, growthRate: 0.03 })
    ).rejects.toThrow('Invalid discount or growth rate')
  })
})