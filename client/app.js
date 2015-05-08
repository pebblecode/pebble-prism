'use strict';

var config = {
  accessPoints: [{
    name: 'AP 1',
    mac: '00:18:0a:ab:9f:00',
    lat: 51.485507622841,
    lng: -0.118509843014181,
    color: '#276fdc'
  }, {
    name: 'AP 2',
    mac: '00:18:0a:ab:9e:c0',
    lat: 51.4854758881698,
    lng: -0.118493749760091,
    color: '#e22d00'
  }, {
    name: 'AP 3',
    mac: '00:18:0a:ab:a8:80',
    lat: 51.4854365068737,
    lng: -0.11845531873405,
    color: '#00aedb'
  }, {
    name: 'AP 4',
    mac: '00:18:0a:aa:d0:a0',
    lat: 51.4854391427336,
    lng: -0.118544711731374,
    color: '#f4ce00'
  }, {
    name: 'AP 5',
    mac: '00:18:0a:ac:31:00',
    lat: 51.4854037151986,
    lng: -0.118526376318187,
    color: '#1bb610'
  }]
};


L.mapbox.accessToken = 'pk.eyJ1IjoiZXlrbyIsImEiOiJKRklpR3VVIn0.zTF3HKvPqaZbVNEgzl3TxQ';
var map = L.mapbox.map('map', 'eyko.m4g58njk');

var apLayerGroup = L.layerGroup(_.map(config.accessPoints, function (ap) {
  var marker = L.marker([ap.lat, ap.lng]);
  marker.setIcon(L.mapbox.marker.icon({
    'marker-color': ap.color,
    'marker-size': 'small',
    'stroke-width': 2
  }));
  return marker;
}));


apLayerGroup.addTo(map);


// events

var devices = {};
var devicesLayerGroup = L.layerGroup(null);

var es = new EventSource('http://pebble-prism.herokuapp.com/subscribe');
es.onmessage = function (e) {
  devicesLayerGroup.clearLayers();

  var msg = JSON.parse(e.data);
  var apMac = msg.data.accessPointMac;

  devices[apMac] = _.map(msg.data.deviceCoordinates, function (coord) {
    var marker = L.circleMarker([coord.lat, coord.lng], {
      radius: coord.unc,
      fill: true,
      fillColor: config.accessPoints.filter(function (item) { return item.mac === apMac; })[0].color,
      fillOpacity: 0.3,
      stroke: true,
      color: config.accessPoints.filter(function (item) { return item.mac === apMac; })[0].color,
      opacity: 0.8
    });

    marker.setStyle(L.mapbox.marker.icon({

    }));

    return marker;
  });

  for (var key in devices) {
    if (devices.hasOwnProperty(key)) {
      devices[key].forEach(function (item) {
        devicesLayerGroup.addLayer(item);
      })
    }
  }
};

devicesLayerGroup.addTo(map);
