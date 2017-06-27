'use strict';

import {$runTranspile, Run} from './run-transpile';

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

process.on('warning', function (w: any) {
  console.error('\n', ' => Suman warning => ', (w.stack || w), '\n');
});

//core
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as assert from 'assert';

//npm
const async = require('async');
const residence = require('residence');
const debug = require('suman-debug')('s:utils');
const mkdirp = require('mkdirp');

//project
const _suman = global.__suman = (global.__suman || {});
const isX = require('./is-x');
const toStr = Object.prototype.toString;
const fnToStr = Function.prototype.toString;
const isFnRegex = /^\s*(?:function)?\*/;
import allDebug from './we-are-debugging'
import Timer = NodeJS.Timer;

/////////////////////////////////////////////////////////////////////////////

export interface MapToTargetDirResult {
  originalPath: string,
  targetPath: string
}

export interface INearestRunAndTransformRet {
  run: string,
  transform: string
}


/////////////////////////////////////////////////////////////////////////////////


let globalProjectRoot: string;

export const weAreDebugging = allDebug.weAreDebugging;
export const isStream = isX.isStream;
export const isObservable = isX.isObservable;
export const isSubscriber = isX.isSubscriber;
export const runTranspile: Run = $runTranspile;

export const vgt = function (val: number): boolean {
  return _suman.sumanOpts && _suman.sumanOpts.verbosity > val;
};

export const vlt = function (val: number): boolean {
  return _suman.sumanOpts && _suman.sumanOpts.verbosity < val;
};

export const mapToTargetDir = function (item: string): MapToTargetDirResult {

  const projectRoot = process.env.SUMAN_PROJECT_ROOT;
  // note => these values were originally assigned in suman/index.js,
  // were then passed to suman server, which then required this file
  const testDir = process.env.TEST_DIR;
  const testSrcDir = process.env.TEST_SRC_DIR;
  const testTargetDir = process.env.TEST_TARGET_DIR;
  const testTargetDirLength = String(testTargetDir).split(path.sep).length;

  item = path.resolve(path.isAbsolute(item) ? item : (projectRoot + '/' + item));

  let itemSplit = String(item).split(path.sep);
  itemSplit = itemSplit.filter(i => i); // get rid of pesky ['', first element

  const originalLength = itemSplit.length;
  const paths = removeSharedRootPath([projectRoot, item]);
  const temp = paths[1][1];

  let splitted = temp.split(path.sep);
  splitted = splitted.filter(i => i); // get rid of pesky ['', first element

  debug('splitted before shift:', splitted);

  while ((splitted.length + testTargetDirLength) > originalLength + 1) {
    splitted.shift();
  }

  debug('splitted after shift:', splitted);

  const joined = splitted.join(path.sep);

  debug('pre-resolved:', joined);
  debug('joined:', joined);

  return {
    originalPath: item,
    targetPath: path.resolve(testTargetDir + '/' + joined)
  }
};

export const isSumanSingleProcess = function (): boolean {
  return process.env.SUMAN_SINGLE_PROCESS === 'yes';
};

export const isSumanDebug = function (): boolean {
  return process.env.SUMAN_DEBUG === 'yes';
};

export const runAssertionToCheckForSerialization = function (val: Object): void {
  if (!val) {
    return;
  }
  assert(['string', 'boolean', 'number'].indexOf(typeof val) >= 0,
    ' => Suman usage error => You must serialize data called back from suman.once.pre.js value functions, ' +
    'here is the data in raw form =>\n' + val + ' and here we have run util.inspect on it =>\n' + util.inspect(val));
};

export const buildDirsWithMkDirp = function (paths: Array<string>, cb: Function): void {
  async.each(paths, function (p: string, cb: Function) {
    mkdirp(p, cb);
  }, cb);
};

export const getArrayOfDirsToBuild = function (testTargetPath: string, p: string): string | undefined {

  // => p is expected to be a path to a file, not a directory
  let temp: string;
  const l = path.normalize('/' + testTargetPath).split('/').length;
  const items = path.normalize('/' + p).split('/');

  debug(' => length of testTargetPath:', l);
  debug(' => items length:', items.length);

  if (fs.statSync(p).isFile()) {
    items.pop(); // always get rid of the first file
  }

  if (items.length >= l) {
    temp = path.normalize(items.slice(l).join('/'));
  }
  else {
    console.log('\n');
    console.error(' => Suman-Utils warning => path to file was not longer than path to test-target dir.');
    console.error(' => Suman-Utils warning => path to file =>', p);
    console.error(' => Suman-Utils warning => testTargetDir =>', testTargetPath);
    console.log('\n');
  }

  if (temp) {
    return path.resolve(testTargetPath + '/' + temp);
  }
  else {
    //explicit for your pleasure; and so TS does not complain
    return undefined;
  }

};

export const checkIfPathAlreadyExistsInList = function (paths: Array<string>, p: string, index: number): boolean {

  // assume paths =>  [/a/b/c/d/e]
  // p => /a/b/c
  // this fn should return true then

  return paths.some(function (pth, i) {
    if (i === index) {
      // we ignore the matching item
      return false;
    }
    return String(pth).indexOf(p) === 0;
  });

};

export const buildDirs = function (dirs: Array<string>, cb: Function): void {

  if (dirs.length < 1) {
    return process.nextTick(cb);
  }

  async.eachSeries(dirs, function (item: string, cb: Function): void {

    fs.mkdir(item, function (err: Error) {
      if (err && !String(err.stack).match(/eexist/i)) {
        console.error(err.stack || err);
        cb(err);
      }
      else {
        cb(null);
      }
    });

  }, cb);

};

export const padWithFourSpaces = function (): string {
  return new Array(5).join(' ');  //yields 4 whitespace chars
};

export const padWithXSpaces = function (x: number): string {
  return new Array(x + 1).join(' ');  //yields x whitespace chars
};

export const removePath = function (p1: string, p2: string): string {

  assert(path.isAbsolute(p1) && path.isAbsolute(p2), 'Please pass in absolute paths, ' +
    'p1 => ' + util.inspect(p1) + ', p2 => ' + util.inspect(p2));

  const split1 = String(p1).split(path.sep);
  const split2 = String(p2).split(path.sep);

  const newPath: Array<string> = [];

  const max = Math.max(split1.length, split2.length);

  for (let i = 0; i < max; i++) {
    if (split1[i] !== split2[i]) {
      newPath.push(split1[i]);
    }
  }

  return newPath.join(path.sep);

};

export const findSharedPath = function (p1: string, p2: string): string {

  const split1 = String(p1).split(path.sep);
  const split2 = String(p2).split(path.sep);

  //remove weird empty strings ''
  const one = split1.filter(i => i);
  const two = split2.filter(i => i);

  const max = Math.max(one.length, two.length);

  // if (split1[0] === '') {
  //     split1.shift();
  // }
  //
  // if (split2[0] === '') {
  //     split2.shift();
  // }

  let i = 0;
  let shared: Array<string> = [];

  while (one[i] === two[i] && i < max) {
    shared.push(one[i]);
    i++;
    if (i > 100) {
      throw new Error(' => Suman implementation error => first array => ' + one + ', ' +
        'second array => ' + two);
    }
  }

  shared = shared.filter(i => i);
  return path.resolve(path.sep + shared.join(path.sep));
};

export const removeSharedRootPath = function (paths: Array<string>): Array<Array<string>> {

  if (paths.length < 2) {   //  paths = ['just/a/single/path/so/letsreturnit']
    return paths.map(function (p) {
      return [p, path.basename(p)];
    });
  }

  let shared: string | Array<string>;

  paths.forEach(function (p) {

    //assume paths are absolute before being passed here
    p = path.normalize(p);

    if (shared) {
      const arr = String(p).split('');

      let i = 0;

      arr.every(function (item, index) {
        if (String(item) !== String(shared[index])) {
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
    return [p, p.substring(Math.min(shared.length, (p.length - basenameLngth)), p.length)];
  });

};

export const checkForValInStr = function (str: string, regex: RegExp, count: number): boolean {
  //used primarily to check if 'done' literal is in fn.toString()
  return ((String(str).match(regex) || []).length > (count === 0 ? 0 : (count || 1)));
};

export const isGeneratorFn2 = function (fn: Function): boolean {
  const str = String(fn);
  const indexOfFirstParen = str.indexOf('(');
  const indexOfFirstStar = str.indexOf('*');
  return indexOfFirstStar < indexOfFirstParen;
};

export const isGeneratorFn = function (fn: Function): boolean {

  if (typeof fn !== 'function') {
    return false;
  }
  let fnStr = toStr.call(fn);
  return ((fnStr === '[object Function]' || fnStr === '[object GeneratorFunction]') && isFnRegex.test(fnToStr.call(fn))
  || (fn.constructor.name === 'GeneratorFunction' || fn.constructor.displayName === 'GeneratorFunction'));

};

export const isArrowFunction = function (fn: Function): boolean {
  //TODO this will not work for async functions!
  return fn && String(fn).trim().indexOf('function') !== 0;
};

export const isAsyncFn = function (fn: Function): boolean {
  return fn && String(fn).trim().indexOf('async ') === 0;
};

export const defaultSumanHomeDir = function (): string {
  return path.normalize(path.resolve((process.env.HOME || process.env.USERPROFILE) + path.sep + 'suman_data'));
};

export const defaultSumanResultsDir = function (): string {
  return path.normalize(path.resolve(getHomeDir() + path.sep + 'suman' + path.sep + 'test_results'));
};

export const getHomeDir = function (): string {
  return process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
};

export const findProjectRoot = function (p: string): string {
  if (!globalProjectRoot) {
    globalProjectRoot = residence.findProjectRoot(p);
  }
  return globalProjectRoot;
};

export const findProjRoot = findProjectRoot;

export const once = function (ctx: Object, fn: Function): Function {

  let callable = true;
  return function callOnce(err: Error) {
    if (callable) {
      callable = false;
      return fn.apply(ctx, arguments);
    }
    else {
      _suman.logWarning('suman implementation warning => function was called more than once => ' + fn ? fn.toString() : '');
      if (err) {
        _suman.logError('warning => ', err.stack || util.inspect(err));
      }
    }
  }
};

export const onceTO = function (ctx: Object, to: Timer, fn: Function): Function {

  let callable = true;
  return function callOnce(err: Error) {
    if (callable) {
      clearTimeout(to);
      callable = false;
      return fn.apply(ctx, arguments);
    }
    else {
      _suman.logWarning('suman implementation warning => function was called more than once => ' + fn ? fn.toString() : '');
      if (err) {
        _suman.logError('warning => ', err.stack || util.inspect(err));
      }
    }
  }
};

export const onceAsync = function (ctx: Object, fn: Function): Function {

  let callable = true;

  return function callOnce(err: Error) {
    const args = arguments;
    if (callable) {
      callable = false;
      process.nextTick(function () {
        fn.apply(ctx, args);
      });
    }
    else {
      console.log(' => Suman warning => function was called more than once -' + fn ? fn.toString() : '');
      if (err) {
        console.error(' => Suman warning => \n', err.stack || util.inspect(err));
      }
    }

  }
};

export const makePathExecutable = function(runPath: string,cb: Function){

  if(!runPath){
     process.nextTick(cb);
  }
  else{
    fs.chmod(runPath, 511, cb);
  }
};

export const checkForEquality = function (arr1: Array<string>, arr2: Array<string>): boolean {

  if (arr1.length !== arr2.length) {
    return false;
  }

  arr1 = arr1.sort();
  arr2 = arr2.sort();

  for (let i = 0; i < arr1.length; i++) {
    if (String(arr1[i]) !== String(arr2[i])) {
      return false;
    }
  }

  return true;
};

export const arrayHasDuplicates = function (a: Array<any>): boolean {
  return !a.every(function (item, i) {
    return a.indexOf(item) === i;
  });
};

export const findNearestRunAndTransform = function (root: string, pth: string, cb: Function) {

  try {
    const isDir = fs.statSync(pth).isDirectory();
    if (!isDir) {
      pth = path.dirname(pth);
    }
  }
  catch (err) {
    return process.nextTick(cb, err);
  }

  let results: Array<any> = [];
  let upPath: string = pth;

  async.whilst(function () {

    return upPath.length >= root.length;

  }, function (cb: Function) {

    async.parallel({

      run: function (cb: Function) {
        let p = path.resolve(upPath + '/@run.sh');
        fs.stat(p, function (err, stats) {
          let z = (stats && stats.isFile()) ? {run: p} : undefined;
          // z && results.push(z);
          z && results.unshift(z);
          cb();
        });
      },

      transform: function (cb: Function) {
        let p = path.resolve(upPath + '/@transform.sh');
        fs.stat(p, function (err, stats) {
          let z = (stats && stats.isFile()) ? {transform: p} : undefined;
          // z && results.push(z);
          z && results.unshift(z);
          cb();
        });
      }

    }, function (err: Error) {
      upPath = path.resolve(upPath + '/../');
      cb(err);
    });

  }, function (err: Error) {
    if (err) {
      return cb(err);
    }

    // let obj : INearestRunAndTransformRet = {};
    //
    results.forEach(function (r) {
      console.log('results => ', r);
    });

    let ret : INearestRunAndTransformRet= results.reduce(function(prev,curr){
          return (curr ? Object.assign(prev, curr) : prev);
    }, {});

    cb(null, ret);

  });

};

export interface IMapValue {
  [key: string]: boolean,
  '@transform.sh?': boolean,
  '@run.sh?': boolean,
  '@target?': boolean,
  '@src?': boolean
}

export interface IMap {
  [key: string]: IMapValue
}

export interface IMapCallback {
  (err: Error | null, map?: IMap): void
}

export const findSumanMarkers = function (types: Array<string>, root: string, files: Array<string>, cb: IMapCallback): void {

  //TODO: we can stop when we get to the end of all the files in files array
  const map: any = {};

  let addItem = function (item: string): void {
    let filename = path.basename(item);
    types.forEach(function (t) {
      if (filename === t) {
        if (!map[path.dirname(item)]) {
          map[path.dirname(item)] = {};
        }
        map[path.dirname(item)][t] = true;
      }
    });
  };

  (function getMarkers(dir: string, cb: Function) {

    fs.readdir(dir, function (err, items) {

      if (err) {
        console.log(' => [suman internal] => probably a symlink => ', dir);
        console.error(err.stack || err);
        return cb(err);
      }

      items = items.map(function (item) {
        return path.resolve(dir, item);
      });

      async.eachLimit(items, 5, function (item: string, cb: Function) {

        fs.stat(item, function (err, stats) {

          if (err) {
            console.log(' => [suman internal] => probably a symlink => ', item);
            console.error(err.stack || err);
            return cb();
          }

          if (stats.isFile()) {
            addItem(item);
            cb();
          }
          else if (stats.isDirectory()) {
            //TODO: stop here if this item is deeper than any of the files passed in
            if (!/node_modules/.test(String(item)) && !/\/.git\//.test(String(item))) {
              addItem(item);
              getMarkers(item, cb);
            }
            else {
              console.log(' => Warning => node_modules/.git path ignored => ', item);
              cb();
            }
          }
          else {
            console.log(' => Not directory or file => ', item);
            cb();
          }

        });

      }, cb);

    });

  })(root, function (err: Error) {
    if (err) {
      cb(err);
    }
    else {
      cb(null, map);
    }
  });

};

export const makeResultsDir = function (bool: boolean, cb: Function): void {
  if (!bool) {
    process.nextTick(cb);
  }
  else {
    process.nextTick(function () {
      cb(null);
    });
  }
};

export const isObject = function (v: any) {
  return v && typeof v === 'object' && !Array.isArray(v);
};

///////////// support node style imports ////////////////////////////////////////////////

let $exports = module.exports;
export default $exports;

//////////////////////////////////////////////////////////////////////////////////////////




