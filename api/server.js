const express = require('express');
const Hobbit = require('./hobbits/hobbits-model.js');
const server = express();

server.use(express.json());

server.get('/', async (req, res) => {
  res.status(200).json({ api: 'up' });
});

server.get("/hobbits", (req, res) => {
  Hobbit.getAll()
    .then(hobbits => {
      res.status(200).json(hobbits);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get("/hobbits/:id", async (req, res) => {
  const hobbit = await Hobbit.getById(req.params.id);
  if (!hobbit) {
    res.status(404).end();
  } else {
    res.json(hobbit);
  }
});

server.post("/hobbits", async (req, res) => {
  const newHobbit = await Hobbit.insert(req.body);
  res.json(newHobbit);
});

server.delete("/hobbits/:id", (req, res) => {
  res.end();
});

server.put("/hobbits/:id", (req, res) => {
  res.end();
});

module.exports = server;
