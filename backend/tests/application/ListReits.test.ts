import { ListReits } from '../../src/application/ListReits'
import { InMemoryReitSnapshotRepository } from '../../src/infrastructure/InMemoryReitSnapshotRepository'
import { ReitSnapshot } from '../../src/domain/ReitSnapshot'

describe('ListReits', () => {
  it('returns all REIT snapshots sorted by ticker', async () => {
    const snapshots: ReitSnapshot[] = [
      {
        ticker: 'PLD',
        name: 'Prologis',
        sector: 'Industrial',
        dividendYield: 2.5,
        totalReturn1Y: 8.1,
      },
      {
        ticker: 'O',
        name: 'Realty Income',
        sector: 'Retail',
        dividendYield: 5.0,
        totalReturn1Y: 3.2,
      },
      {
        ticker: 'AMT',
        name: 'American Tower',
        sector: 'Infrastructure',
        dividendYield: 2.0,
        totalReturn1Y: 6.4,
      },
    ]

    const repository = new InMemoryReitSnapshotRepository(snapshots)
    const useCase = new ListReits(repository)

    const result = await useCase.execute()

    // ensures everything is returned and sorted by ticker
    expect(result.map((r) => r.ticker)).toEqual(['AMT', 'O', 'PLD'])
    expect(result[0].name).toBe('American Tower')
    expect(result[0].dividendYield).toBe(2.0)
  })

  it('filters REIT snapshots by sector when sector is provided', async () => {
    const snapshots: ReitSnapshot[] = [
      {
        ticker: 'PLD',
        name: 'Prologis',
        sector: 'Industrial',
        dividendYield: 2.5,
        totalReturn1Y: 8.1,
      },
      {
        ticker: 'O',
        name: 'Realty Income',
        sector: 'Retail',
        dividendYield: 4.8,
        totalReturn1Y: 3.2,
      },
      {
        ticker: 'AMT',
        name: 'American Tower',
        sector: 'Specialized',
        dividendYield: 2.0,
        totalReturn1Y: 6.4,
      },
    ]

    const repository = new InMemoryReitSnapshotRepository(snapshots)
    const useCase = new ListReits(repository)

    const result = await useCase.execute({ sector: 'Industrial' })

    // ensures only the requested sector is returned
    expect(result.map((r) => r.ticker)).toEqual(['PLD'])
  })

  it('filters REIT snapshots by minimum dividend yield when minDividendYield is provided', async () => {
    const snapshots: ReitSnapshot[] = [
      {
        ticker: 'PLD',
        name: 'Prologis',
        sector: 'Industrial',
        dividendYield: 2.5,
        totalReturn1Y: 8.1,
      },
      {
        ticker: 'O',
        name: 'Realty Income',
        sector: 'Retail',
        dividendYield: 5.0,
        totalReturn1Y: 3.2,
      },
      {
        ticker: 'AMT',
        name: 'American Tower',
        sector: 'Infrastructure',
        dividendYield: 2.0,
        totalReturn1Y: 6.4,
      },
    ]

    const repository = new InMemoryReitSnapshotRepository(snapshots)
    const useCase = new ListReits(repository)

    const result = await useCase.execute({ minDividendYield: 4.0 })

    // only REITs with dividendYield >= 4.0 should be returned
    expect(result.map((r) => r.ticker)).toEqual(['O'])
  })
})
