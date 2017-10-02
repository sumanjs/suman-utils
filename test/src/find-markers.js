


const su = require('suman-utils');
const path = require('path');

const dir = path.resolve(__dirname + '/../../test');

su.findSumanMarkers(['@transform.sh','@run.sh'], dir , [], function(err, map){

  if(err) throw err;

  console.log('map => ', map);

});