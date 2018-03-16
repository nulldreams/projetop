const api = require('./controllers/filmes')

module.exports = (fastify) => {
  fastify.addContentTypeParser('*', (req, done) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      done(data)
    })
  })

  fastify.get('/filmes', api.filmes)
  fastify.get('/api/v1/filme/:path', api.filme)
}
