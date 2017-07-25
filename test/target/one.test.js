var utils = require('suman-utils');
[
    utils.isGeneratorFn(function* () { }),
    utils.isGeneratorFn2(function* () { }),
    utils.isGeneratorFn2(function () { })
].forEach(function (item) {
    console.log('isGen => ', item);
});
