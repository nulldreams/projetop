const db = require('../../db/database')

exports.filmes = (req, reply) => {
  db.findByTema(req.params.tema, (err, tema) => {
    if (err) return reply.code(500).send({ err })

    reply.code(200).send(tema)
  })
}
