const path = require('path')
const Datastore = require('nedb')
const _ = require('lodash')

const db = new Datastore({
  filename: path.join(__dirname, `filmes.db`)
})

db.loadDatabase()
db.persistence.setAutocompactionInterval(1000 * 60 * 1)

function get (query, cb) {
  db.find(query, cb)
}

function findByTema (tema, callback) {
  db.find({ tema: tema }, (err, _tema) => {
    // let order = _.sortBy(_tema[0], ['filmes.info.lancamento'])
    let order = _.orderBy(_tema[0].filmes, (e) => {
      return e.info.lancamento
    }, ['desc'])

    callback(null, order)
  })
}

function getAll (callback) {
  db.find({}, callback)
}

function add (filme, cb) {
  db.findOne({}, (err, documento) => {
    if (err) return cb(err)
    if (!documento) {
      return db.insert({ filmes: [filme] }, cb)
    }

    documento.filmes.push(filme)
    db.update({}, documento, {}, cb)
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
  findByTema,
  getAll,
  add,
  remove,
  removeAll,
  get
}
