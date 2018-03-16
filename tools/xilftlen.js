const req = require('./request')
const cheerio = require('cheerio')
const database = require('../db/database')
const _ = require('lodash')
const sleep = require('sleep')
let filmes = []

async function baseSerie (nomeFilme) {
  // let body = await req.get(`https://www.xilften.net/series/${nomeFilme}`)
  // const $ = cheerio.load(body)

  // let filme = {
  //   nome: $('.data').eq(0).find('h1').eq(0).text().trim(),
  //   capa: $('.poster').eq(0).find('img').attr('src'),
  //   path: nomeFilme,
  //   generos: await separarGeneros($),
  //   criadores: await criadores($),
  //   elenco: await elenco($),
  //   trailer: $('#trailer').eq(0).find('iframe').eq(0).attr('src'),
  //   sinopse: $('.wp-content').eq(0).find('p').eq(0).text().trim(),
  //   galeria: await galeria($)
  // }
}

async function todosFilmes (pagina) {
  for (let j = 42; j < 111; j++) {
    let body = await req.get(`https://www.xilften.net/filmes/page/${pagina}/`)
    const $ = cheerio.load(body)
    // $('.animation-2').find('article').length
    for (let i = 0; i < $('.animation-2').find('article').length; i++) {
      let body2 = await req.get($('.animation-2').find('article').eq(i).find('.poster').eq(0).find('a').attr('href'))
      const n$ = cheerio.load(body2)

      let _filme = {
        capa: $('.animation-2').find('article').eq(i).find('.poster').eq(0).find('img').attr('src'),
        poster: n$('.poster').eq(0).find('img').attr('src'),
        nota: $('.animation-2').find('article').eq(i).find('.poster').eq(0).find('.rating').text().trim(),
        qualidade: $('.animation-2').find('article').eq(i).find('.poster').eq(0).find('.mepo').text().trim(),
        nome: $('.animation-2').find('article').eq(i).find('.data').eq(0).find('h3').eq(0).text().trim(),
        path: $('.animation-2').find('article').eq(i).find('.poster').eq(0).find('a').attr('href'),
        lancamento: $('.animation-2').find('article').eq(i).find('.data').eq(0).find('span').eq(0).text().trim(),
        imdb: $('.animation-2').find('article').eq(i).find('.metadata').eq(0).find('.imdb').eq(0).text().trim(),
        views: $('.animation-2').find('article').eq(i).find('.metadata').eq(0).find('span').eq(1).text().trim(),
        generos: await separarGeneros($, i),
        sinopse: n$('.wp-content').eq(0).find('p').eq(0).text().trim(),
        galeria: await galeria(n$),
        titulo_original: n$('.custom_fields').find('span').eq(0).text().trim(),
        relacionados: await relacionados(n$),
        elenco: await elenco(n$),
        diretor: await criadores(n$),
        trailer: n$('.videobox').eq(0).find('iframe').eq(0).attr('src'),
        extra: {
          lancamento: n$('.extra').find('.date').text().trim(),
          pais: n$('.extra').find('.country').text().trim(),
          duracao: n$('.extra').find('.runtime').text().trim(),
          rate: n$('.extra').find('.rated').text().trim()
        },
        video: {
          opcoes: await filme($('.animation-2').find('article').eq(i).find('.poster').eq(0).find('a').attr('href'))
        }
      }

      database.add(_filme, (err, resultado) => {
        console.log('Terminou o filme ', _filme.nome)
        console.log('Filme indice ', i)
        console.log('Página ', j)
      })
    }

    console.log('Vou dormir por 20 segundos')
    sleep.sleep(20)
    console.log('acordei')
  }
}

async function opcoes (url) {
  let body = await req.get(url)
  const $ = cheerio.load(body)

  let opcoes = []
  for (let i = 0; i < $('.playex').find('div').length; i++) {
    let url = $('.playex').find('div').eq(i).find('iframe').eq(0).attr('src')
    return new Promise((resolve, reject) => {
      opcoes.push({
        url: url,
        audio: $('.sourceslist').find('li').eq(i).text().trim().toUpperCase(),
        source: {}
      })
      return resolve(opcoes)
    })
  }
}

async function unitPlay (id) {
  let body = await req.post(`https://unitplay.net/video/${id}`, {
    id,
    type: 'load_url'
  })
  return new Promise((resolve, reject) => {
    let retorno = body.replace(/\\/g, '')
    return resolve(retorno.substring(10, retorno.length - 2))
  })
}

async function video (option) {
  console.log(option.url)
  if (option.url.indexOf('unitplay') > -1) {
    let urlVideo = await unitPlay(option.url.match(/\d+/)[0])
    let body = await req.get(option.url)
    const $ = cheerio.load(body)
    return new Promise((resolve, reject) => {
      let html = ''
      $('script').each(function (i, elem) {
        if ($(this).attr('type') === 'text/rocketscript') {
          html = $(this).html()
        }
      })
      let source = {
        imagem: '',
        video: urlVideo,
        audio: option.audio
      }
      let elementos = html.split('\n')

      for (let elemento of elementos) {
        if (elemento.indexOf('image') > -1) {
          let elem = elemento.trim()
          source.imagem = elem.substring(21, elem.length - 2)
        }
      }
      return resolve(source)
    })
  } else {
    let body = await req.get(option.url)
    const $ = cheerio.load(body)
    return new Promise((resolve, reject) => {
      let html = ''
      $('script').each(function (i, elem) {
        if ($(this).attr('type') === 'text/javascript') {
          html = $(this).html()
        }
      })
      let source = { url_original: option.url, imagem: '', video: '', audio: option.audio }
      let elementos = html.split('\n')
      for (let elemento of elementos) {
        if (elemento.indexOf('mp4file') > -1) {
          let elem = elemento.trim()
          source.video = elem.substring(12, elem.length - 2)
        }
        if (elemento.indexOf('image') > -1) {
          let elem = elemento.trim()
          source.imagem = elem.substring(10, elem.length - 2)
        }
      }
      return resolve(source)
    })
  }
}

async function filme (url) {
  let opts = await opcoes(url)
  let videos = []
  for (let option of opts) {
    videos.push(await video(option))
  }

  return new Promise((resolve, reject) => {
    resolve(videos)
  })
}

async function separarGeneros ($, indice) {
  return new Promise((resolve, reject) => {
    let generos = []
    $('.genres').eq(indice).find('a').each(function (i, elem) {
      generos.push($(this).text().trim())
    })
    return resolve(generos)
  })
}

async function relacionados ($) {
  return new Promise((resolve, reject) => {
    let relacionados = []
    $('.srelacionados').eq(0).find('article').each(function (i, elem) {
      relacionados.push({
        imagem: $(this).find('img').attr('src'),
        titulo: $(this).find('img').attr('alt'),
        url: $(this).find('a').attr('href').replace('https://www.xilften.net/filmes/', '').replace('/', '')
      })
    })
    return resolve(relacionados)
  })
}

async function galeria ($) {
  return new Promise((resolve, reject) => {
    let galeria = []
    $('.galeria').eq(0).find('.g-item').each(function (i, elem) {
      galeria.push($('.galeria').eq(0).find('.g-item').eq(i).find('img').attr('src').replace('\n', ''))
    })
    return resolve(galeria)
  })
}

async function elenco ($) {
  return new Promise((resolve, reject) => {
    let elenco = []
    $('.persons').eq(1).find('.person').each(function (i, elem) {
      elenco.push({
        imagem: $('.persons').eq(1).find('.person').eq(i).find('img').eq(0).attr('src'),
        nome: $('.persons').eq(1).find('.person').eq(i).find('.name').eq(0).text().trim(),
        personagem: $('.persons').eq(1).find('.person').eq(i).find('.caracter').eq(0).text().trim()
      })
    })
    return resolve(elenco)
  })
}

async function criadores ($) {
  return new Promise((resolve, reject) => {
    let criadores = []
    $('.persons').eq(0).find('.person').each(function (i, elem) {
      criadores.push({
        imagem: $('.persons').eq(0).find('.person').eq(i).find('img').eq(0).attr('src'),
        nome: $('.persons').eq(0).find('.person').eq(i).find('.data').eq(0).find('.name').text().trim()
      })
    })
    return resolve(criadores)
  })
}

// baseSerie('american-gods')
todosFilmes(1)
