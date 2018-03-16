const request = require('request')

async function get (url) {
  return new Promise((resolve, reject) => {
    request(url, { timeout: 120000 }, (error, response, body) => {
      if (error) return reject(error)

      return resolve(body)
    })
  })
}

async function post (url, data) {
  return new Promise((resolve, reject) => {
    request({ url, method: 'POST', formData: data }, (error, response, body) => {
      if (error) return reject(error)

      return resolve(body)
    })
  })
}

module.exports = {
  get,
  post
}
