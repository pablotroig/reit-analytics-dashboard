import { GetReitDetails } from '../../src/application/GetReitDetails'
import { InMemoryReitSnapshotRepository } from '../../src/infrastructure/InMemoryReitSnapshotRepository'
import { ReitSnapshot } from '../../src/domain/ReitSnapshot'

describe('GetReitDetails', () => {
  it('returns the REIT snapshot matching the given ticker', async () => {
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
    ]

    const repository = new InMemoryReitSnapshotRepository(snapshots)
    const useCase = new GetReitDetails(repository)

    const result = await useCase.execute('O')

    // ensures we get the correct REIT back
    expect(result.ticker).toBe('O')
    expect(result.name).toBe('Realty Income')
    expect(result.dividendYield).toBe(5.0)
  })

  it('throws an error when no REIT exists for the given ticker', async () => {
    const snapshots: ReitSnapshot[] = [
      {
        ticker: 'PLD',
        name: 'Prologis',
        sector: 'Industrial',
        dividendYield: 2.5,
        totalReturn1Y: 8.1,
      },
    ]

    const repository = new InMemoryReitSnapshotRepository(snapshots)
    const useCase = new GetReitDetails(repository)

    // ensures a clear error is thrown when the ticker is unknown
    await expect(useCase.execute('O')).rejects.toThrow('REIT not found')
  })
})
