const request = require('request')
const cheerio = require('cheerio')
const db = require('./db/database')
const async = require('async')
var arr = {
  tema: '',
  filme: {}
}
var temas = [
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
var indice = 0

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
  arr.tema = 'lancamentos'
  let option = {
    url: `http://filmeseseriesonline.net/filmes/${arr.tema}/page/${index}/`,
    method: 'GET'
  }
  request(option, (err, response, body) => {
    console.log(index)
    const $ = cheerio.load(body)
    for (let i = 0; i < $('.filmes').eq(0).find('.item').length; i++) {
      // let titulo = $('.filmes').eq(0).find('.item').eq(i).find('.titulo').eq(0).find('a').eq(0).text().trim().toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ã/g, 'a').replace(/õ/g, 'o').replace(/à/g, 'a').replace(/è/g, 'e').replace(/ì/g, 'i').replace(/ò/g, 'o').replace(/ù/g, 'u').replace(/â/g, 'a').replace(/ê/g, 'e').replace(/î/g, 'i').replace(/ô/g, 'o').replace(/û/g, 'u').replace(/’/g, '').replace(/ç/g, 'c').replace(/ - /g, '-')
      // let nome = $('.filmes').eq(0).find('.item').eq(i).find('.titulo').eq(0).find('a').eq(0).text().trim()
      let titulo = $('.filmes').eq(0).find('.item').eq(i).find('.titulo').eq(0).find('a').eq(0).attr('href').replace('http://filmeseseriesonline.net/', '').replace('/', '').trim()

      consultarFilme(titulo, (err, filme) => {
        filme.imagem = $('.filmes').eq(0).find('.item').eq(i).find('.imagem').eq(0).find('img').eq(0).attr('src').trim()
        // console.log(filme)
        async.waterfall([
          function (callback) {
            arr.filme = filme
            console.log(arr.filme.nome)
            callback(null, 'one')
          },
          function (arg1, callback) {
            db.add(arr, (err, result) => {
              callback(null, `${arr.filme.nome} foi adicionado!`)
            })
          }
        ], function (err, result) {
          console.log(result)
        })
      })

      // arr.filmes.push({
      //   titulo: $('.filmes').eq(0).find('.item').eq(i).find('.titulo').eq(0).find('a').eq(0).text().trim(),
      //   url: $('.filmes').eq(0).find('.item').eq(i).find('.titulo').eq(0).find('a').eq(0).attr('href').trim(),
      //   imagem: $('.filmes').eq(0).find('.item').eq(i).find('.imagem').eq(0).find('img').eq(0).attr('src').trim(),
      //   audio: $('.filmes').eq(0).find('.item').eq(i).find('.imagem').eq(0).find('span').eq(0).text().trim()
      // })
      if (i + 1 === $('.filmes').eq(0).find('.item').length) {
        return consultarFilmes(index + 1)
      }
    }
    // console.log(arr.filmes.length)
    // fs.writeFileSync(`./arquivos/${arr.tema}.js`, arr.filmes)
  })
}

// function urlFilme(id, cb) {
//   let option = {
//     url: `http://filmeseseriesonline.net/embed/e/?openload=${id}`,
//     method: 'GET'
//   }
//   request(option, (err, response, body) => {
//     const $ = cheerio.load(body)
//     cb(null, $('iframe').eq(0).attr('src'))
//   })
// }

function consultarFilme (nomeFilme, cb) {
  let option = {
    url: `http://filmeseseriesonline.net/${nomeFilme}/`,
    method: 'GET'
  }
  request(option, (err, response, body) => {
    const $ = cheerio.load(body)
    let url = $('.embeds-servidores').eq(0).find('iframe').eq(0).attr('src')
    let id = url === undefined ? url = $('.embed-servidores').eq(0).find('a').attr('href') : url.substring(url.indexOf('openload='), url.indexOf('&')).replace('openload=', '')
    let filme = {
      nome: $('.content').eq(0).find('h2').eq(0).text().trim(),
      sinopse: $('.content').eq(0).find('p').eq(1).text().replace('Filme Online Mad Max', '').trim(),
      url: `http://openload.co/embed/${id}`,
      info: {
        qualidade: $('.infos-post').eq(0).find('li').eq(0).text().replace('Qualidade:', '').trim(),
        lancamento: $('.infos-post').eq(0).find('li').eq(1).text().replace('Lançamento:', '').trim(),
        audio: $('.infos-post').eq(0).find('li').eq(2).text().replace('Áudio:', '').trim(),
        visitas: $('.infos-post').eq(0).find('li').eq(3).text().replace('Visitas:', '').trim()
      }
    }

    return cb(null, filme)
  })
}

// consultarFilme()
consultarFilmes(1, (err, result) => {
  console.log('teste')
})
// consultarTemas()
