//#core
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const cp = require('child_process');

//#npm
const async = require('async');
const residence = require('residence');
const _ = require('lodash');

const toStr = Object.prototype.toString;
const fnToStr = Function.prototype.toString;
const isFnRegex = /^\s*(?:function)?\*/;

/////////////////////////////////////////////////////////////////////////////////////

module.exports = Object.freeze({

  getArrayOfDirsToBuild: function (testTargetPath, p) {

    // => p is expected to be a path to a file, not a directory

    const temp = [];

    const l = path.normalize(testTargetPath).split(path.sep).length;
    const items = path.normalize(p).split(path.sep);

    if(process.env.SUMAN_DEBUG === 'yes'){
      console.log('length of testTargetPath:', l);
      console.log('items length:', items.length);
    }

    var unexpected = true;

    while (items.length > l) {
      unexpected = false;
      items.pop();
      temp.unshift(items.slice(l).join(path.sep));
    }

    if (unexpected) {
      console.error(' => Internal lib warning => path to file was not longer than path to test-target dir.');
    }

    return temp.map(item => {
      return path.normalize(testTargetPath + path.sep + item);
    });
  },

  buildDirs: function (dirs, cb) {

    async.eachSeries(dirs, function (item, cb) {

      fs.mkdir(item, function (err) {
        if (err && !String(err.stack).match(/eexist/i)) {
          console.log(err.stack || err);
          cb(err);
        }
        else {
          cb(null);
        }
      });

    }, function (err) {
      process.nextTick(function () {
        cb(err);
      })
    });

  },

  padWithFourSpaces: function () {
    return new Array(5).join(' ');  //yields 4 whitespace chars
  },

  removeSharedRootPath: function (paths) {

    if (paths.length < 2) {
      return paths.map(function (p) {
        return [ p, path.basename(p) ];
      });
    }

    var shared = null;

    paths.forEach(function (p) {

      //assume paths are absolute before being passed here
      p = path.normalize(p);

      if (shared) {
        const arr = String(p).split('');

        var i = 0;

        arr.every(function (item, index) {
          if (String(item) !== String(shared[ index ])) {
            i = index;
            return false;
          }
          return true;
        });

        shared = shared.slice(0, i);

      }
      else {
        shared = String(p).split('');
      }

    });

    return paths.map(function (p) {
      const basenameLngth = path.basename(p).length;
      return [ p, p.substring(Math.min(shared.length, (p.length - basenameLngth)), p.length) ];
    });

  },

  checkForValInStr: function (str, regex) {   //used primarily to check if 'done' literal is in fn.toString()
    return ((String(str).match(regex) || []).length > 1);
  },

  isArrowFunction: function (fn) { //TODO this will not work for async functions!
    return fn.toString().indexOf('function') !== 0;
  },

  getStringArrayOfArgLiterals: function (fn) {
    // if function(a,b,c){}  ---> return ['a','b','c']
  },

  defaultSumanHomeDir: function () {
    return path.normalize(path.resolve((process.env.HOME || process.env.USERPROFILE) + path.sep + 'suman_data'));
  },

  defaultSumanResultsDir: function () {
    return path.normalize(path.resolve(this.getHomeDir() + path.sep + 'suman' + path.sep + 'test_results'));
  },

  getHomeDir: function () {
    return process.env[ (process.platform === 'win32' ? 'USERPROFILE' : 'HOME') ];
  },

  findProjectRoot: function findProjRoot () {
    if (!findProjRoot.root) {
      findProjRoot.root = residence.findProjectRoot.apply(global, arguments);
    }
    return findProjRoot.root;
  },  // reference residence version for this call

  once: function sumanOnce (ctx, fn) {

    var callable = true;

    return function () {
      if (callable) {
        callable = false;
        fn.apply(ctx, arguments);
      }
      else {
        console.log(' => Suman warning => function was called more than once -' + fn.toString());
        console.error(new Error('Suman error').stack);
      }

    }
  },

  checkForEquality: function checkForArrayOfStringsEquality (arr1, arr2) {

    if (arr1.length !== arr2.length) {
      return false;
    }

    arr1 = arr1.sort();
    arr2 = arr2.sort();

    for (var i = 0; i < arr1.length; i++) {
      if (String(arr1[ i ]) !== String(arr2[ i ])) {
        return false;
      }
    }

    return true;
  },

  isGeneratorFn: function isGeneratorFn (fn) {

    if (typeof fn !== 'function') {
      return false;
    }
    var fnStr = toStr.call(fn);
    return ((fnStr === '[object Function]' || fnStr === '[object GeneratorFunction]') && isFnRegex.test(fnToStr.call(fn))
    || (fn.constructor.name === 'GeneratorFunction' || fn.constructor.displayName === 'GeneratorFunction'));

  },

  arrayHasDuplicates: function arrayHasDuplicates (a) {
    return _.uniq(a).length !== a.length;
  },

  isReadableStream: function isReadableStream (obj) {
    return obj instanceof stream.Stream && typeof obj._read === 'function' && typeof obj._readableState === 'object';
  },

  makeResultsDir: function (bool, cb) {

    if (!bool) {
      process.nextTick(cb);
    }
    else {

      process.nextTick(function () {
        cb(null);
      });

    }
  }

});


