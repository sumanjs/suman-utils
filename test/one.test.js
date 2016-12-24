/**
 * Created by oleg on 12/19/16.
 */



const utils = require('../utils');

[
    utils.isGeneratorFn(function *() {}),
    utils.isGeneratorFn2(function* () {}),
    utils.isGeneratorFn2( () =>{})

].forEach(function (item) {
    console.log('isGen => ', item);
});



