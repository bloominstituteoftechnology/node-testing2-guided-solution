# Node Server Testing Guided Project

Guided project for **Node Server Testing** Module.

## Project Setup

- [ ] clone this repository.
- [ ] move inside the project folder.
- [ ] type `npm i` to download dependencies.
- [ ] type `npm run migrate` to run migrations.
- [ ] type `npm run seed` to seed the db.
- [ ] type `npm run server` to start the API.

## Introduce the Guided Project

- Introduce the [guided project](https://github.com/bloominstituteoftechnology/node-testing2-guided).

## Add .env File to Root Folder

- open `index.js`, note that we're ready to support environment variables.
- add empty `.env`, we'll use it later for configuring postgres (time allowing).

**wait for students to catch up**

## Configure Jest

- We can generate a Jest config file running `npx jest --init`. An assistant launches and we can set the environment to `node` from there.

## Create/Edit the "test" script with flags

- Edit the package.json to add/edit the "test" script:

  ```json
  "test": "jest --verbose --runInBand"
  ```

- The `runInBand` flag is used to run all tests serially, as there is database access involved.
- **This configuration is not good enough** because it will use the same database as development.

**restart the server/test if they were running** for the changes to take effect.

**wait for students to catch up**

## Introduce cross-env

- Explain what `cross-env` does in the `test` script inside `package.json`.
- Open `./data/dbConfig.js` and show how we're using `NODE_ENV` to dynamically load a different `knex` configuration for testing.
- Open `knexfile.js` and show we have separate configurations for testing and development.
- We will have separate databases for development and for testing inside the `data` folder.
- Edit the package.json to set the correct environment for the tests using `cross-env`:

  ```json
  "test": "cross-env NODE_ENV=testing jest --verbose --runInBand"
  ```

**take time to answer questions**

**wait for students to catch up**

## Avoid Address in Use Errors When Running Tests

Explain that if the server is defined and started in the same file, it would throw an Address in Use error when running the second test. Having the server separate from the call to `.listen()` avoids that. we're good to go on this.

## Introduce supertest

- introduce [supertest](https://www.npmjs.com/package/supertest) and explain what it does.
- add `supertest` as a dev dependency.
- add `./api/server.spec.js`:

  ```js
  // ./api/server.js
  const request = require('supertest'); // install this as a dev dependency
  const db = require('../data/dbConfig.js');
  const server = require('./server.js');

  beforeAll(async () => {
    // migrate the db programatically
    await db.migrate.rollback()
    await db.migrate.latest()
  })
  beforeEach(async () => {
    // each test must have same initial state
    await db('hobbits').truncate()
  })
  afterAll(async () => {
    // close the connection to the db at the end
    await db.destroy()
  })

  describe('server.js', () => {
    // this test helps make sure we're working on the right environment
    it('should set testing environment', () => {
      expect(process.env.NODE_ENV).toBe('testing');
    });
  });
  ```

**wait for students to catch up**

We're going to use `supertest` to test:

- http status code
- format of the data (JSON)
- shape of the response body

## Test that and Endpoint Returns the Correct HTTP Status Code

- add a test for the `GET /` endpoint.

```js
describe('sever.js', () => {
  describe('GET /', () => {
    it('should return 200 OK', () => {
      // explain that we need to return the call to request()
      // this signals to jest that this test is asynchronous and it needs
      // to wait for the promise to resolve, before running the assertions
      return request(server)
        .get('/')
        .then(res => {
          // the response object has useful methods we can use
          expect(res.status).toBe(200);
        });
    });

    // using the squad (async/await) we don't need to return anything
    // jes will wait because of the async function
    it('should return 200 OK using the squad', async () => {
      const res = await request(server).get('/');

      expect(res.status).toBe(200);
    });
  });
});
```

**wait for students to catch up**

## Test that and Endpoint Returns the Correct Format (JSON)

```js
it('should return JSON', async () => {
  const res = await request(server).get('/');
  expect(res.type).toBe('application/json');
});
```

**wait for students to catch up**

## Test the Shape of the Response Body

```js
it('should return { api: "up" }', async () => {
  const res = await request(server).get('/');
  expect(res.body).toEqual({ api: 'up' });
});
```

**wait for students to catch up**

**time for a break? Take 5 minutes**

## Write End to End Tests that Involve the Database

Open `./hobbits/hobbits-model.js`. We'll use **TDD** to implement the data access code.

- open `./hobbits/hobbits-model.spec.js`.
- add a test for the `insert` method

  ```js
  // we'll use this to verify hobbits model is working
  const db = require('../../data/dbConfig.js');
  const Hobbits = require('./hobbits-model.js');

  beforeAll(async () => {
    await db.migrate.rollback()
    await db.migrate.latest()
  });
  beforeEach(async () => {
    await db('hobbits').truncate()
  });
  afterAll(async () => {
    await db.destroy()
  });

  describe('hobbits model', () => {
    describe('insert()', () => {
      it('should insert the provided hobbits into the db', async () => {
        await Hobbits.insert({ name: 'gaffer' });
        await Hobbits.insert({ name: 'sam' });

        const hobbits = await db('hobbits');
        expect(hobbits).toHaveLength(2);
      });
    });
  });
  ```

- Implement code to make the tests pass

  ```js
  // ./hobbits/hobbits-model.js
  async function insert(hobbit) {
    // the second parameter here is of other databases, SQLite returns the id by default
    const [id] = await db('hobbits').insert(hobbit, 'id');

    return db('hobbits')
      .where({ id })
      .first();
  }
  ```

**wait for students to catch up**

- What if the insert is failing and the tests pass because there are other hobbits already in the database? let's add another test.

```js
// note we're checking one hobbit at a time
it('should insert the provided hobbit into the db', async () => {
  let hobbit = await Hobbits.insert({ name: 'gaffer' });
  expect(hobbit.name).toBe('gaffer');

  // note how we're reusing the hobbit variable
  hobbit = await Hobbits.insert({ name: 'sam' });
  expect(hobbit.name).toBe('sam');
});
```

- The test passes. Here is the code that ensures that each test starts with a clean table:

```js
beforeEach(async () => {
  await db('hobbits').truncate();
});
```

**wait for students to catch up**

Do another review of how everything works together.

**Emphasize that all of these inserts target the test database (test.db3)**, running the server will show the data from the `hobbits.db3` database.
