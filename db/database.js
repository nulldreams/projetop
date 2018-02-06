const path = require('path')
const Datastore = require('nedb')
const _ = require('lodash')

const db = new Datastore({
  filename: path.join(__dirname, `filmes.db`)
})

db.loadDatabase()
db.persistence.setAutocompactionInterval(1000 * 60 * 1)

function get (id, callback) {
  db.findOne({
    _id: id
  }, callback)
}

function getAll (callback) {
  db.find({}, callback)
}

function add (filme, cb) {
  db.findOne({ tema: filme.tema }, (err, doc) => {
    if (err) return cb(err)
    if (!doc) {
      filme.quantidade = filme.filmes.length
      return db.insert(filme, cb)
    }

    doc.filmes = _.concat(doc.filmes, filme.filmes)
    doc.quantidade = doc.filmes.length
    db.update({ tema: filme.tema }, doc, {}, (err, updated) => {
      return console.log('updated', updated)
    })
  })
}

function remove (id) {
  return new Promise((resolve, reject) => {
    db.remove({
      _id: id
    }, (err, removido) => {
      if (err) return reject(err)

      resolve(removido)
    })
  })
}

function removeAll () {
  return new Promise((resolve, reject) => {
    db.remove({}, { multi: true }, function (err, numRemoved) {
      if (err) return reject(err)

      resolve(numRemoved)
    })
  })
}

module.exports = {
  get,
  getAll,
  add,
  remove,
  removeAll
}
