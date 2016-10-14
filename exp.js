/**
 * Created by t_millal on 10/13/16.
 */




const utils = require('./utils');


const obj = {
    destroyAllPools1: function*() {

        const a = yield new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(3);
            }, 1000);
        });

        yield 7;
    },

    destroyAllPools2: function*yolo() {

        const a = yield new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(3);
            }, 1000);
        });

        yield 7;
    }
};


console.log(utils.isGeneratorFn(obj.destroyAllPools1));
console.log(utils.isGeneratorFn(obj.destroyAllPools2));