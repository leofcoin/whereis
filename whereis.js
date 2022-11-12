const dotenv = require('dotenv')
const Koa = require('koa')
const fetch = require('node-fetch')
const cors = require('@koa/cors');

dotenv.config()
const accessToken = dotenv.accessToken

const server = new Koa()
const cache = new Map()
server.use(cors({
  origin: '*'
}))

setInterval(() => {
  const now = new Date().getTime()
  for (const [key, {timestamp}] of cache.entries()) {
    if (timestamp + 8.64e+7 >= now) {
      cache.delete(key)
    }
  }
}, 4.32e+7) // 0.5 day

const whereis = async ip => {
  const url = `https://ipwho.is/${ip}`

  const options = {
    method: 'GET',
    // headers: {
    //   'X-RapidAPI-Key': 'd750860d0amshc4aef751c1a2769p18b50ejsn8b67eac32a55',
    //   'X-RapidAPI-Host': 'ip-geolocation-ipwhois-io.p.rapidapi.com'
    // }
  }

  let response = await fetch(url, options)
  response = response.json()
  return response
}

server.use(async ctx => {
  if (ctx.query && ctx.query.ip) {
    if (cache.has(ctx.query.ip)) {
      const data = cache.get(ctx.query.ip)
      data.timestamp = new Date().getTime()
      cache.set(ctx.query.ip, data)
      ctx.body = data.value
      return
    }
    response = await whereis(ctx.query.ip)
    const data = {
      value: {
        lat: response.latitude,
        lon: response.longitude,
        country: response.country,
        flag: response.flag
      },
      timestamp: new Date().getTime()
    }
    cache.set(ctx.query.ip, data)
    ctx.body = data.value
    return
  }
})

module.exports = port => {
  return server.listen(port)
}
