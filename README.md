# Node Server Testing Guided Project

Guided project for **Web Testing IV** Module.

## Project Setup

- [ ] fork and clone this repository.
- [ ] **CD into the folder** where you cloned **your fork**.
- [ ] type `npm i` to download dependencies.
- [ ] type `npm run server` to start the API.

Please follow along as the instructor add automated tests to the API.

## How to Contribute

- clone the [starter code](https://github.com/LambdaSchool/node-server-testing-guided).
- create a solution branch: `git checkout -b solution`.
- add this repository as a remote: `git remote add solution https://github.com/LambdaSchool/node-server-testing-guided-solution`
- pull from this repository's `master` branch into the `solution` branch in your local folder `git pull solution master:solution --force`.

A this point you should have a `master` branch pointing to the student's repository and a `solution` branch with the latest changes added to the solution repository.

When making changes to the `solution` branch, commit the changes and type `git push solution solution:master` to push them to this repository.

When making changes to the `master` branch, commit the changes and use `git push origin master` to push them to the student's repository.

## Introduce the Module Challenge

Take time to explain what is expected from the [module challenge](https://github.com/LambdaSchool/node-server-testing-challenge), and provide hints about what to test.

## Introduce the Guided Project

Introduce the [guided project](https://github.com/LambdaSchool/node-server-testing-guided).

- fork and clone it.
- install dependencies.
- run it to make sure there are no errors.

**wait for students to catch up**

## Add .env File to Root Folder

- open `index.js`, note that we're ready to support environment variables.
- add empty `.env`, we'll use it later.

**wait for students to catch up**

## Change Jest Environment to Node

Explain that `Jest` runs in browser mode using `jsdom`, for server testing we need to change it to run in **node mode**.

- open `package.json` and add:

```json
"jest" : {
  "testEnvironment": "node"
}
```

**restart the server/test if they were running** for the changes to take effect.

**wait for students to catch up**

## Introduce cross-env

Explain what `cross-env` does in the `test` script inside `package.json`.

- open `./data/dbConfig.js` and show how we're using `DB_ENV` to dynamically load a different `knex` configuration for testing.
- open `knexfile.js` and show we have separate configurations for testing and development.
- open the `data` folder and show that we have separate databases to go with the configurations.

**take time to answer questions**

## Pass Environment Flag to Knex Migrations and Seeding

- delete the test database.
- run the command `npx knex migrate:latest --env=testing` and explain how it works in tandem with the configuration defined inside `knexfile.js`.

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

const server = require('./server.js');

describe('sever.js', () => {
  // this test helps make sure we're working on the right environment
  it('should set testing environment', () => {
    expect(process.env.DB_ENV).toBe('testing');
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

Open `./hobbits/hobbitsModel.js`. We'll use **TDD** to implement the data access code.

- open `./hobbits/hobbitsModel.spec.js`.
- add a test for the `insert` method

```js
// we'll use this to verify hobbitsModel is working
const db = require('../data/dbConfig.js');
const Hobbits = require('./hobbitsModel.js');

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

Implement code to make the tests pass

```js
// ./hobbits/hobbitsModel.js
async function insert(hobbit) {
  // the second parameter here is of other databases, SQLite returns the id by default
  const [id] = await db('hobbits').insert(hobbit, 'id');

  return db('hobbits')
    .where({ id })
    .first();
}
```

**wait for students to catch up**

What if the insert is failing and the tests pass because there are other hobbits already in the database? let's add another test.

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

The test passes, but makes the prior test fail because each test is inserting new data into the database.

We can fix that by truncating the _hobbits_ table before running each test.

```js
beforeEach(async () => {
  await db('hobbits').truncate();
});
```

**wait for students to catch up**

Do another review of how everything works together.

**Emphasize that all of these inserts target the test database (test.db3)**, running the server will show the data from the `hobbits.db3` database.

## Deploy to Heroku with PostgreSQL

- new app
- connect it
- /hobbits hast seeded data
- `Resources` > postgres > provision
- commit 'add tests' > should deploy
- refresh app, should still work

Time to add postgres configuration for the database

- change knexfile
- add 'pg' package
- show settings > reveal config files DATABASE_URL
- commit and push 'adds production db config'
- deployed, **still reading the development database**
- open dbConfig, we use DB_ENV
- **add this environment variable to heroku**
- fails because **hobbits table does not exist in heroku**.

### Run Migrations On Heroku

```sh
npx heroku run knex migrate:latest -a lshobbits
npx heroku run knex seed:run -a lshobbits
```

change DB_ENV to be development and switch it back to show the effect

show the returning inside hobbitsModel.js

`const [id] = await db('hobbits').insert(hobbit, 'id'); // show the 'id'-*`
