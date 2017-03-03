
const utils = require('../utils');

[
    utils.isGeneratorFn(function *() {}),
    utils.isGeneratorFn2(function* () {}),
    utils.isGeneratorFn2( () =>{})

].forEach(function (item) {
    console.log('isGen => ', item);
});



