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
  const url = `https://whois.as207111.net/api/lookup?ip_address=${ip}`
  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  }
  let response = await fetch(url, { headers })
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
        lat: response.lat,
        lon: response.lon,
        country: response.country
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
