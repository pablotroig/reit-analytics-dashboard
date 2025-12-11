import request from 'supertest'
import { createApp } from '../../src/api/createApp'
import { InMemoryReitSnapshotRepository } from '../../src/infrastructure/InMemoryReitSnapshotRepository'
import { ReitSnapshot } from '../../src/domain/ReitSnapshot'

describe('Reits API', () => {
  it('GET /reits returns REITs with filters applied', async () => {
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
    const app = createApp(repository)

    // Request only Retail REITs with dividendYield >= 4.0
    const response = await request(app)
      .get('/reits')
      .query({ sector: 'Retail', minDividendYield: 4.0 })

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body).toHaveLength(1)
    expect(response.body[0].ticker).toBe('O')
    expect(response.body[0].name).toBe('Realty Income')
  })

  it('GET /reits/:ticker returns details for an existing REIT', async () => {
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
    const app = createApp(repository)

    const response = await request(app).get('/reits/O')

    expect(response.status).toBe(200)
    expect(response.body.ticker).toBe('O')
    expect(response.body.name).toBe('Realty Income')
    expect(response.body.dividendYield).toBe(5.0)
  })

  it('GET /reits/:ticker returns 404 when the REIT does not exist', async () => {
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
    const app = createApp(repository)

    const response = await request(app).get('/reits/O')

    expect(response.status).toBe(404)
    expect(response.body.error).toBe('REIT not found')
  })
})
