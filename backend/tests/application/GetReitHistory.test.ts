import { GetReitHistory } from '../../src/application/GetReitHistory'
import { InMemoryReitHistoryRepository } from '../../src/infrastructure/InMemoryReitHistoryRepository'
import { InMemoryReitSnapshotRepository } from '../../src/infrastructure/InMemoryReitSnapshotRepository'

const snapshotData = [
  { ticker: 'O', name: 'Realty Income', sector: 'Retail', dividendYield: 4.8, totalReturn1Y: 12.5 }
]

const historyData = {
  O: [
    { date: '2024-01-01', price: 55.12 },
    { date: '2024-02-01', price: 56.44 },
    { date: '2024-03-01', price: 54.88 }
  ]
}

describe('GetReitHistory', () => {
  it('returns historical data for a valid REIT ticker', async () => {
    const snapshotRepo = new InMemoryReitSnapshotRepository(snapshotData)
    const historyRepo = new InMemoryReitHistoryRepository(historyData)
    const usecase = new GetReitHistory(snapshotRepo, historyRepo)

    const result = await usecase.execute('O')

    expect(result.length).toBe(3)
    expect(result[0]).toEqual({ date: '2024-01-01', price: 55.12 })
  })

  it('returns history sorted ascending by date', async () => {
    const snapshotRepo = new InMemoryReitSnapshotRepository(snapshotData)

    const scrambledHistory = {
      O: [
        { date: '2024-03-01', price: 54.88 },
        { date: '2024-01-01', price: 55.12 },
        { date: '2024-02-01', price: 56.44 }
      ]
    }

    const historyRepo = new InMemoryReitHistoryRepository(scrambledHistory)
    const usecase = new GetReitHistory(snapshotRepo, historyRepo)

    const result = await usecase.execute('O')

    expect(result.map(h => h.date)).toEqual([
      '2024-01-01',
      '2024-02-01',
      '2024-03-01'
    ])
  })

  it('throws if REIT does not exist', async () => {
    const snapshotRepo = new InMemoryReitSnapshotRepository(snapshotData)
    const historyRepo = new InMemoryReitHistoryRepository(historyData)
    const usecase = new GetReitHistory(snapshotRepo, historyRepo)

    await expect(usecase.execute('XYZ')).rejects.toThrow('REIT not found')
  })

  it('throws if no history exists for the REIT', async () => {
    const snapshotRepo = new InMemoryReitSnapshotRepository(snapshotData)
    const historyRepo = new InMemoryReitHistoryRepository({}) // no history
    const usecase = new GetReitHistory(snapshotRepo, historyRepo)

    await expect(usecase.execute('O')).rejects.toThrow('No history available')
  })
})
