// vince: 192.168.3.63
// paul: 192.168.3.71

var listenport = process.env.PORT || 9201;                      //TCP listening port
var secret = 'pebbleprism';                      //Secret that you chose in the Meraki dashboard
var validator = "5637aaef252addd4d6682c7aff3ee877d018ac0c";    //Validator string that is shown in the Meraki dashboard

var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var _ = require('lodash');

var app = express();
app.use(serveStatic(__dirname));

var knownHosts = ['/192.168.3.63', '/192.168.3.71'];

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var clients = [];

app.get('/meraki', function (req, res) {
  console.log("sending validation")
  res.send(validator);
});

app.post('/meraki', function (req, res) {
  try {
    var observations = req.body.data.observations;

    var matchingObservations = _.filter(observations, function (item) {
      return _.contains(knownHosts, item.ipv4);
    });
    console.log('=== MATCHING OBSERVATIONS', JSON.stringify(matchingObservations));
    var deviceData = req.body.data;

    if (req.body.secret === secret && matchingObservations.length) {
      clients.forEach(function (c) {
        c.write('data: ' + JSON.stringify({data: matchingObservations, type: req.body.type}) + '\n\n');
      });
    } else {
      console.log("invalid secret from  " + req.connection.remoteAddress);
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

    clients.push(res);
    console.log('New connection');
  }

  req.on('close', function () {
    console.log('Connection closing');
    if (clients.indexOf(res) >= 0) {
      clients.pop(res);
    }
  });
});

app.listen(listenport);
console.log("Meraki presence API receiver listening on port " + listenport);