const express = require('express')
const app = express()

const min = require('minimist')
const args = min(process.argv.slice(2))

const morgan = require('morgan')

const db = require('./database.js')

args['port']
const port = args.port || 5000

// See what is stored in the object produced by minimist
console.log(args)

// Store help text 
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit

if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// Middleware
app.use((req, res, next) => {
    let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers['referer'],
      useragent: req.headers['user-agent']
  }

  const stmt = logdb.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  next()
})


// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

app.get('/app/', (req, res) => {
    // Respond with status 200
        res.statusCode = 200;
    // Respond with status message "OK"
        res.statusMessage = 'OK';
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end(res.statusCode+ ' ' +res.statusMessage)
});

app.get('/app/flip/', (req, res) => {
    let flip = coinFlip()
    res.statusCode = 200
    res.json({ 'flip': flip })
})

app.get('/app/flips/:number', (req, res) => {
    let flips = coinFlips(req.params.number)
    let total = countFlips(flips)
    res.statusCode = 200
    res.json({ 'raw': flips, 'summary': total })
})

app.get('/app/flip/call/heads', (req, res) => {
    let heads = flipACoin('heads')
    res.statusCode = 200
    res.json(heads)
})

app.get('/app/flip/call/tails', (req, res) => {
    let tails = flipACoin('tails')
    res.statusCode = 200
    res.json(tails)
})

// Default response for any other request
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});

// Coin Functions
function coinFlip() {
    let num = Math.floor(Math.random() * 2)
    
    if (num == 0){
      return 'heads'
    }

    return 'tails'
}

function coinFlips(flips) {
    let flip = []

    for (let i = 0; i < flips; i++){
      flip[i] = coinFlip()
    }

    return flip
}

function countFlips(array) {
    let tails = 0
    let heads = 0

    for (let i = 0; i < array.length; i++){
      if (array[i] == 'heads'){
        heads++
      } else{
        tails++
      }
    } 

    if (tails == 0){
      return { 'heads': heads }
    } else if (heads == 0){
      return { 'tails': tails }
    }

    return { 'heads': heads, 'tails': tails }
}

function flipACoin(call) {
    let flip = coinFlip()

    if (flip != call){
      return { 'call': call, 'flip': flip, 'result': 'lose' }
    }

    return { 'call': call, 'flip': flip, 'result': 'win' }
}