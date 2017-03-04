

const sumanUtils = require('suman-utils');

const arr = sumanUtils.getArrayOfDirsToBuild(
  '/Users/Olegzandr/WebstormProjects/oresoftware/suman/test-target',
  '/Users/Olegzandr/WebstormProjects/oresoftware/suman/test/integration-tests/test0.js'
);

console.log(arr);