const request = require('request')
const cheerio = require('cheerio')

function consultarTemas (cb) {
  let option = {
    url: 'http://filmeseseriesonline.net/',
    method: 'GET'
  }
  request(option, (err, response, body) => {
    const $ = cheerio.load(body)

    for (let i = 0; i < $('.listagem-categorias').eq(0).find('li').length; i++) {
      let quantidade = $('.listagem-categorias').eq(0).find('li').eq(i).find('a').eq(0).find('span').eq(0).text().trim()
      console.log({
        tema: $('.listagem-categorias').eq(0).find('li').eq(i).find('a').eq(0).find('h2').eq(0).text().trim().replace(quantidade, '').trim(),
        url: $('.listagem-categorias').eq(0).find('li').eq(i).find('a').eq(0).attr('href').trim(),
        quantidade: quantidade
      })
    }
  })
}

function consultarFilmes (index, cb) {
  let temas = [
    'lancamentos',
    'filmes-hd',
    'series',
    'acao',
    'animes',
    'antigos',
    'animacao',
    'aventura',
    'desenhos',
    'comedia',
    'c-romantica',
    'corrida',
    'crime',
    'documentario',
    'drama',
    'fantasia',
    'faroeste',
    'ficcao',
    'guerra',
    'musical',
    'nacional',
    'policial',
    'religioso',
    'romance',
    'suspense',
    'terror',
    'thriller'
  ]

  for (let j = 0; j < temas.length; j++) {
    let option = {
      url: `http://filmeseseriesonline.net/filmes/${temas[j]}/page/${index}/`,
      method: 'GET'
    }
    request(option, (err, response, body) => {
      const $ = cheerio.load(body)

      for (let i = 0; i < $('.filmes').eq(0).find('.item').length; i++) {
        console.log({
          titulo: $('.filmes').eq(0).find('.item').eq(i).find('.titulo').eq(0).find('a').eq(0).text().trim(),
          url: $('.filmes').eq(0).find('.item').eq(i).find('.titulo').eq(0).find('a').eq(0).attr('href').trim(),
          imagem: $('.filmes').eq(0).find('.item').eq(i).find('.imagem').eq(0).find('img').eq(0).attr('src').trim(),
          audio: $('.filmes').eq(0).find('.item').eq(i).find('.imagem').eq(0).find('span').eq(0).text().trim()
        })
        if (i + 1 === $('.filmes').eq(0).find('.item').length) return consultarFilmes(index + 1)
      }
    })
  }
}

function consultarFilme (cb) {
  let option = {
    url: 'http://filmeseseriesonline.net/carandiru/',
    method: 'GET'
  }
  request(option, (err, response, body) => {
    const $ = cheerio.load(body)

    console.log({
      nome: $('.content').eq(0).find('h2').eq(0).text().trim(),
      sinopse: $('.content').eq(0).find('p').eq(1).text().replace('Filme Online Mad Max', '').trim(),
      info: {
        qualidade: $('.infos-post').eq(0).find('li').eq(0).text().replace('Qualidade:', '').trim(),
        lancamento: $('.infos-post').eq(0).find('li').eq(1).text().replace('Lançamento:', '').trim(),
        audio: $('.infos-post').eq(0).find('li').eq(2).text().replace('Áudio:', '').trim(),
        visitas: $('.infos-post').eq(0).find('li').eq(3).text().replace('Visitas:', '').trim()
      }
    })
  })
}

// consultarFilme()
consultarFilmes(1)
// consultarTemas()
