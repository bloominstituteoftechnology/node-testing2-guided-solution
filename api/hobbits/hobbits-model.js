const db = require('../../data/dbConfig.js');

module.exports = {
  insert,
  update,
  remove,
  getAll,
  getById,
};

async function insert(hobbit) {
  const [id] = await db('hobbits').insert(hobbit);
  return db('hobbits').where({ id }).first();
}

async function update(id, changes) {
  await db('hobbits').where({ id }).update(changes);
  return db('hobbits').where({ id }).first();
}

function remove(id) {
  return db('hobbits').where({ id }).delete();
}

function getAll() {
  return db('hobbits');
}

function getById(id) {
  return db('hobbits').where({ id }).first();
}
