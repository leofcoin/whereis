#!/usr/bin/env node

const args = process.argv.slice(2, process.argv.length);
const whereis = require('./../whereis.js')

let port = args.indexOf('--port')
port = args[port + 1]
if (!port) port = 8787

whereis(port)
