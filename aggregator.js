var _ = require('lodash');

function groupBy (key, data) {
  var aggregatedData = {};

  _.forEach(data, function (item) {
    if (!item[key]) return;

    if (!aggregatedData[item[key]]) {
      aggregatedData[item[key]] = 1;
    } else {
      aggregatedData[item[key]] += 1;
    }
  });

  return aggregatedData;
}


exports.update = function update(networkData) {
  var deviceCoordinates = [];
  var devicesByOS = groupBy('os', networkData.data.observations);

  var data = {
    accessPointMac: networkData.data.apMac
  };

  _.forEach(networkData.data.observations, function (item) {

    if (item && item.location) {
      deviceCoordinates.push({
        clientMac: item.clientMac,
        lat: item.location.lat,
        lng: item.location.lng,
        unc: item.location.unc
      });
    }
  });


  data.deviceCount = networkData.data.observations.length;
  data.devicesByOS = devicesByOS;
  data.deviceCoordinates = deviceCoordinates;

  return data;
}