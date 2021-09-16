const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server.js')

const Sam = { name: 'Sam' }
const Frodo = { name: 'Frodo' }

beforeAll(async () => {
  await db.migrate.rollback() // so any changes to migration files are picked up
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('hobbits').truncate()
})
afterAll(async () => {
  await db.destroy()
})

describe('server.js', () => {
  it('should set testing environment', () => {
    expect(process.env.NODE_ENV).toBe('testing')
  })

  describe('[GET] /', () => {
    it('should return 200 OK', () => {
      // explain that we need to return the call to request()
      // this signals to jest that this test is asynchronous and it needs
      // to wait for the promise to resolve, before running the assertions
      return request(server)
        .get('/')
        .then(res => {
          // the response object has useful methods we can use
          expect(res.status).toBe(200)
        })
    })
    // using the squad (async/await) we don't need to return anything
    // jes will wait because of the async function
    it('should return 200 OK using the squad', async () => {
      const res = await request(server).get('/')
      expect(res.status).toBe(200)
    })
    it('should return JSON', async () => {
      const res = await request(server).get('/')
      expect(res.type).toBe('application/json')
    })
    it('should return { api: "up" }', async () => {
      const res = await request(server).get('/')
      expect(res.body).toEqual({ api: 'up' })
    })
    it('[GET] / another way of doing it', () => {
      return request(server)
        .get('/')
        .expect('Content-Type', /json/)
        .expect('Content-Length', '12')
        .expect(200)
    })
  })

  describe('[GET] /hobbits', () => {
    it('responds with 200 OK', async () => {
      const res = await request(server).get('/hobbits')
      expect(res.status).toBe(200)
    })
    it('responds with empty array if no hobbits', async () => {
      const res = await request(server).get('/hobbits')
      expect(res.body).toHaveLength(0)
    })
    it('responds with hobbits if hobbits', async () => {
      await db('hobbits').insert(Frodo)
      let res = await request(server).get('/hobbits')
      expect(res.body).toHaveLength(1)
      await db('hobbits').insert(Sam)
      res = await request(server).get('/hobbits')
      expect(res.body).toHaveLength(2)
      expect(res.body[0]).toMatchObject(Frodo)
      expect(res.body[1]).toMatchObject(Sam)
    })
  })

  describe('[GET] /hobbits/:id', () => {
    it('responds with the hobbit with the given id', async () => {
      await db('hobbits').insert(Sam)
      let res = await request(server).get('/hobbits/1')
      expect(res.body).toMatchObject(Sam)
    })
    it('responds with a 404 if id not in db', async () => {
      const response = await request(server).get('/hobbits/1')
      expect(response.status).toBe(404)
    })
  })
  describe('[POST] /hobbits', () => {
    it('resturns the newly created hobbit', async () => {
      const res = await request(server).post('/hobbits').send(Sam)
      expect(res.body.id).toBe(1)
      expect(res.body.name).toBe('Sam')
    })
  })
})
