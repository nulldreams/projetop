const db = require('../../db/database')
const _ = require('lodash')

exports.filmes = (req, reply) => {
  db.get({}, (err, doc) => {
    if (err) return reply.code(500).send({ err })

    let filmes = doc[0].filmes

    reply.code(200).send(filmes)
  })
}

exports.filme = (req, reply) => {
  db.get({}, (err, doc) => {
    let filme = _.find(doc[0].filmes, { path: req.params.path })
    if (err) return reply.code(500).send({ err })

    reply.code(200).send(filme)
  })
}

exports.filmeByTema = (req, reply) => {
  db.get({}, (err, doc) => {
    let filme = _.find(doc[0].filmes, (element, index, array) => {
      if (element.categorias.indexOf(req.params.tema) > -1) { return element }
    })

    if (err) return reply.code(500).send({ err })

    reply.code(200).send(filme)
  })
}
