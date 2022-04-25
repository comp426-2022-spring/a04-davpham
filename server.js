const express = require('express')
const app = express()

const min = require('minimist')
const args = min(process.argv.slice(2))

args['port']
const port = args.port || 5000

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