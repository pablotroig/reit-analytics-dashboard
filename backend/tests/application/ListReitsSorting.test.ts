import { ListReits } from '../../src/application/ListReits'
import { InMemoryReitSnapshotRepository } from '../../src/infrastructure/InMemoryReitSnapshotRepository'
import { ReitSnapshot } from '../../src/domain/ReitSnapshot'

describe('ListReits sorting', () => {
  it('sorts by dividendYield descending', async () => {
    const snapshots: ReitSnapshot[] = [
      { ticker: 'A', name: 'A', sector: 'X', dividendYield: 2.0, totalReturn1Y: 5 },
      { ticker: 'B', name: 'B', sector: 'X', dividendYield: 4.5, totalReturn1Y: 3 },
      { ticker: 'C', name: 'C', sector: 'X', dividendYield: 3.2, totalReturn1Y: 4 },
    ]

    const repo = new InMemoryReitSnapshotRepository(snapshots)
    const useCase = new ListReits(repo)

    const result = await useCase.execute({
      sortBy: 'dividendYield',
      order: 'desc',
    })

    expect(result.map(r => r.ticker)).toEqual(['B', 'C', 'A'])
  })
})
