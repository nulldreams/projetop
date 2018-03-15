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

async function todosFilmes () {
  for (let i = 0; i < 2; i++) {
    let body = await req.get(`https://www.xilften.net/filmes/page/${i + 1}/`)
    console.log(`https://www.xilften.net/filmes/page/${i + 1}/`)
    const $ = cheerio.load(body)

    $('.featured').find('article').each(function (i, elem) {
      filmes.push($(this).find('.data').eq(0).find('h3').eq(0).text().trim())
    })

    if (i + 1 === 2) {
      console.log(filmes)
    }
  }
}

async function opcoes (episodio) {
  let body = await req.get(episodio.urlEpisode)
  const $ = cheerio.load(body)

  return new Promise((resolve, reject) => {
    $('.playex').find('div').each(function (i, elem) {
      episodio.opcoes.push({
        url: $('.playex').find('div').eq(i).find('iframe').eq(0).attr('src'),
        audio: $('.sourceslist').find('li').eq(i).text().trim().toUpperCase(),
        source: {}
      })
    })
    return resolve(episodio)
  })
}

async function video (option) {
  let body = await req.get(option.url)
  const $ = cheerio.load(body)
  return new Promise((resolve, reject) => {
    let html = ''
    $('script').each(function (i, elem) {
      if ($(this).attr('type') === 'text/javascript') {
        html = $(this).html()
      }
    })
    let source = { imagem: '', video: '', audio: option.audio }
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

async function episodios ($) {
  return new Promise((resolve, reject) => {
    let episodes = []
    $('.episodios').find('li').each(function (i, elem) {
      episodes.push({
        capa: $('.episodios').find('li').eq(i).find('.imagen').find('img').eq(0).attr('src'),
        urlEpisode: $('.episodios').find('li').eq(i).find('.imagen').find('a').eq(0).attr('href'),
        numerando: $('.episodios').find('li').eq(i).find('.numerando').text().trim(),
        titulo: $('.episodios').find('li').eq(i).find('.episodiotitle').find('a').eq(0).text().trim(),
        data: $('.episodios').find('li').eq(i).find('.episodiotitle').find('.date').eq(0).text().trim(),
        opcoes: [],
        finalTemp: $('.episodios').find('li').eq(i + 1).find('.episodiotitle').find('a').eq(0).text().trim() === 'Episódio 1'
      })
    })
    return resolve(episodes)
  })
}

async function separarGeneros ($) {
  return new Promise((resolve, reject) => {
    let generos = []
    $('.sgeneros').find('a').each(function (i, elem) {
      generos.push($(this).text().trim())
    })
    return resolve(generos)
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
