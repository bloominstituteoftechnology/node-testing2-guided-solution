const Hobbit = require('./hobbitsModel.js')
const db = require('../data/dbConfig.js')

beforeEach(async () => {
  await db('hobbits').truncate();
});

describe('hobbits model', () => {
  describe('insert()', () => {
    it('inserts provided hobbit into db', async () => {
      await Hobbit.insert({ name: 'gaffer' });
      let hobbits = await Hobbit.getAll();
      expect(hobbits).toHaveLength(1);

      await Hobbit.insert({ name: 'sam' });
      hobbits = await Hobbit.getAll();
      expect(hobbits).toHaveLength(2);
    });

    it('gives back the inserted hobbit', async () => {
      let hobbit = await Hobbit.insert({ name: 'gaffer' });
      expect(hobbit).toMatchObject({ id: 1, name: 'gaffer' });
      hobbit = await Hobbit.insert({ name: 'sam' });
      expect(hobbit).toMatchObject({ id: 2, name: 'sam' });
    });
  });

  describe('update()', () => {
    it('updates the hobbit', async () => {
      await Hobbit.insert({ name: 'gaffer' });
      const updated = await Hobbit.update(1, { name: 'sam' });
      expect(updated).toMatchObject({ id: 1, name: 'sam' });
    });
  });

  describe('remove', () => {
    it('deletes the hobbit', async () => {
      await Hobbit.insert({ name: 'gaffer' });
      await Hobbit.insert({ name: 'sam' });
      await Hobbit.remove(1);
      const hobbits = await db('hobbits');
      expect(hobbits).toHaveLength(1);
    });
  });

  describe('getAll', () => {
    it('gets empty list when no hobbits in db', async () => {
      const hobbits = await Hobbit.getAll();
      expect(hobbits).toHaveLength(0);
    });

    it('can get a list with all hobbits in db', async () => {
      await db('hobbits').insert({ name: 'gaffer' });
      let hobbits = await Hobbit.getAll();
      expect(hobbits).toHaveLength(1);
      await db('hobbits').insert({ name: 'sam' });
      hobbits = await Hobbit.getAll();
      expect(hobbits).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('can find a hobbit by id', async () => {
      await db('hobbits').insert({ name: 'gaffer' });
      await db('hobbits').insert({ name: 'sam' });
      const gaffer = await Hobbit.findById(1);
      const sam = await Hobbit.findById(2);
      expect(gaffer).toMatchObject({ id: 1, name: 'gaffer' });
      expect(sam).toMatchObject({ id: 2, name: 'sam' });
    });
  });
});
