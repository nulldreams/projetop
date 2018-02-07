const req = require('./request')
const db = require('./db/database')
const cheerio = require('cheerio')
const fs = require('fs')
const lista = require('./movies')
var arr = {
  tema: '',
  filme: {}
}

// var arr2 = {
//   tema: '',
//   filmes: []
// }

async function consultarFilmes () {
  let filmes = lista.thriller
  arr.tema = 'thriller'
  for (let i = 0; i < filmes.length; i++) {
    console.log(filmes[i].titulo)
    let body = await req.get(`http://filmeseseriesonline.net/${filmes[i].titulo}/`)

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
    filme.imagem = filmes[i].imagem
    console.log(filme)
    arr.filme = filme
    console.log(i + 1, filmes.length)
    db.add(arr, (err, result) => {
      console.log(result)
    })
  }
}

// async function consultarFilmes (index, cb) {
//   arr2.tema = 'thriller'

//   let response = await req.get(`http://filmeseseriesonline.net/filmes/${arr2.tema}/page/${index}/`)
//   const $ = cheerio.load(response)
//   console.log(response.length)
//   try {
//     for (let i = 0; i < $('.filmes').eq(0).find('.item').length; i++) {
//       let titulo = $('.filmes').eq(0).find('.item').eq(i).find('.titulo').eq(0).find('a').eq(0).attr('href').replace('http://filmeseseriesonline.net/', '').replace('/', '').trim()
//       arr2.filmes.push({ titulo, imagem: $('.filmes').eq(0).find('.item').eq(i).find('.imagem').eq(0).find('img').eq(0).attr('src').trim() })
//       console.log(arr2.filmes)
//       let filmesSalvos = JSON.stringify(arr2.filmes)
//       fs.writeFileSync(`./filmes/${arr2.tema}.js`, filmesSalvos)
//       if (i + 1 === $('.filmes').eq(0).find('.item').length) {
//         return consultarFilmes(index + 1)
//       }
//       // consultarFilme(titulo, (err, filme) => {
//       //   filme.imagem = $('.filmes').eq(0).find('.item').eq(i).find('.imagem').eq(0).find('img').eq(0).attr('src').trim()
//       //   arr.filmes.push(filme)

//       // })
//     }
//   } catch (e) {
//     console.log('teste', e)
//     fs.writeFileSync(`./filmes/${arr2.tema}.js`, arr2.filmes)
//     // db.add(arr, (err, result) => {
//     //   console.log(`${arr.filmes.length} foi adicionado!`)
//     // })
//   }
// }

async function consultarFilme (nomeFilme, cb) {
  let body = await req.get(`http://filmeseseriesonline.net/${nomeFilme}/`)

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
}

consultarFilmes()
