'use strict';

var config = {
  accessPoints: [{
    name: 'AP 1',
    mac: '00:18:0a:ab:9f:00',
    lat: 51.485507622841,
    lng: -0.118509843014181
  }, {
    name: 'AP 2',
    mac: '00:18:0a:ab:9e:c0',
    lat: 51.4854758881698,
    lng: -0.118493749760091
  }, {
    name: 'AP 3',
    mac: '00:18:0a:ab:a8:80',
    lat: 51.4854365068737,
    lng: -0.11845531873405
  }, {
    name: 'AP 4',
    mac: '00:18:0a:aa:d0:a0',
    lat: 51.4854391427336,
    lng: -0.118544711731374
  }, {
    name: 'AP 5',
    mac: '00:18:0a:ac:31:00',
    lat: 51.4854037151986,
    lng: -0.118526376318187
  }]
};

var points = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-0.11851372534988514, 51.485449670914605]
    },
    properties: {
      title: 'asdf',
      radius: 0.1
    }
  }]
};


L.mapbox.accessToken = 'pk.eyJ1IjoiZXlrbyIsImEiOiJKRklpR3VVIn0.zTF3HKvPqaZbVNEgzl3TxQ';
var map = L.mapbox.map('map', 'eyko.m4g58njk');

var apLayerGroup = L.layerGroup(_.map(config.accessPoints, function (ap) {
  var marker = L.marker([ap.lat, ap.lng]);
  marker.setIcon(L.mapbox.marker.icon({
    'marker-color': '#ff0000',
    'marker-size': 'small',
    'stroke-width': 2
  }));
  return marker;
}));


apLayerGroup.addTo(map);


// events
//

var devicesLayerGroup = L.layerGroup(null);

var es = new EventSource('./subscribe');
es.onmessage = function (e) {
  devicesLayerGroup.clearLayers();
  var msg = JSON.parse(e.data);
  _.each(msg.deviceCoordinates, function (coord) {
    var marker = L.circleMarker([coord.lat, coord.lng]).addTo(map);
    devicesLayerGroup.addLayer(marker);
  });
};

