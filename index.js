var listenport = process.env.PORT || 9201;                        //TCP listening port
var secret = 'pebbleprism';                                       //Secret that you chose in the Meraki dashboard
var validator = "5637aaef252addd4d6682c7aff3ee877d018ac0c";       //Validator string that is shown in the Meraki dashboard

var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var aggregator = require('./aggregator');

var app = express();
app.use(serveStatic(__dirname));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var clients = [];
var data;

app.get('/meraki', function (req, res) {
  res.send(validator);
});

app.post('/meraki', function (req, res) {
  try {

    if (req.body.secret === secret) {

      data = aggregator.update(req.body);
      data = req.body;

      if (clients.length) {
        clients.forEach(function (c) {
          c.write('data: ' + JSON.stringify({data: data}) + '\n\n');
        });
      }

    } else {
      console.log("Invalid secret from  " + req.connection.remoteAddress);
    }
  } catch (e) {
    // An error has occured, handle it, by e.g. logging it
    console.log("Error.  Likely caused by an invalid POST from " + req.connection.remoteAddress + ":");
    console.log(e);
  } finally {
    res.end();
  }
});

app.get('/subscribe', function (req, res) {
  if (req.headers.accept && req.headers.accept === 'text/event-stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Accept': '*/*',
      'Access-Control-Allow-Origin': '*'
    });

    res.write(':' + (new Array(2049)).join(' ') + '\n');
    res.write('retry: 2000\n');

    clients.push(res);
  }

  req.on('close', function () {
    if (clients.indexOf(res) >= 0) {
      clients.pop(res);
    }
  });
});

app.listen(listenport);
console.log("Meraki presence API receiver listening on port " + listenport);