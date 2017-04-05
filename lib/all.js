'use strict';
process.on('warning', function (w) {
    console.error('\n', ' => Suman warning => ', (w.stack || w), '\n');
});
var fs = require("fs");
var path = require("path");
var util = require("util");
var assert = require("assert");
var async = require('async');
var residence = require('residence');
var debug = require('suman-debug')('s:utils');
var mkdirp = require('mkdirp');
var isX = require('./is-x');
var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var run_transpile_1 = require("./run-transpile");
var globalProjectRoot;
var su = {
    default: undefined,
    isStream: isX.isStream,
    isObservable: isX.isObservable,
    isSubscriber: isX.isSubscriber,
    runTranspile: run_transpile_1.default,
    vgt: function (val) {
        return global.sumanOpts.verbosity > val;
    },
    vlt: function (val) {
        return global.sumanOpts.verbosity < val;
    },
    mapToTargetDir: function (item) {
        var projectRoot = process.env.SUMAN_PROJECT_ROOT;
        var testDir = process.env.TEST_DIR;
        var testSrcDir = process.env.TEST_SRC_DIR;
        var testTargetDir = process.env.TEST_TARGET_DIR;
        var testTargetDirLength = String(testTargetDir).split(path.sep).length;
        item = path.resolve(path.isAbsolute(item) ? item : (projectRoot + '/' + item));
        var itemSplit = String(item).split(path.sep);
        itemSplit = itemSplit.filter(function (i) { return i; });
        debug('itemSplit:', itemSplit);
        var originalLength = itemSplit.length;
        var paths = su.removeSharedRootPath([projectRoot, item]);
        var temp = paths[1][1];
        debug(' => originalLength:', originalLength);
        debug(' => testTargetDirLength:', testTargetDirLength);
        debug(' => temp path:', temp);
        var splitted = temp.split(path.sep);
        splitted = splitted.filter(function (i) { return i; });
        debug('splitted before shift:', splitted);
        while ((splitted.length + testTargetDirLength) > originalLength + 1) {
            splitted.shift();
        }
        debug('splitted after shift:', splitted);
        var joined = splitted.join(path.sep);
        debug('pre-resolved:', joined);
        debug('joined:', joined);
        return {
            originalPath: item,
            targetPath: path.resolve(testTargetDir + '/' + joined)
        };
    },
    isSumanSingleProcess: function () {
        return process.env.SUMAN_SINGLE_PROCESS === 'yes';
    },
    isSumanDebug: function () {
        return process.env.SUMAN_DEBUG === 'yes';
    },
    runAssertionToCheckForSerialization: function (val) {
        if (!val) {
            return;
        }
        assert(['string', 'boolean', 'number'].indexOf(typeof val) >= 0, ' => Suman usage error => You must serialize data called back from suman.once.pre.js value functions, ' +
            'here is the data in raw form =>\n' + val + ' and here we have run util.inspect on it =>\n' + util.inspect(val));
    },
    buildDirsWithMkDirp: function (paths, cb) {
        async.each(paths, function (p, cb) {
            mkdirp(p, cb);
        }, cb);
    },
    getArrayOfDirsToBuild: function (testTargetPath, p) {
        var temp;
        var l = path.normalize('/' + testTargetPath).split('/').length;
        var items = path.normalize('/' + p).split('/');
        debug(' => length of testTargetPath:', l);
        debug(' => items length:', items.length);
        if (fs.statSync(p).isFile()) {
            items.pop();
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
            return undefined;
        }
    },
    checkIfPathAlreadyExistsInList: function (paths, p, index) {
        return paths.some(function (pth, i) {
            if (i === index) {
                return false;
            }
            return String(pth).indexOf(p) === 0;
        });
    },
    buildDirs: function (dirs, cb) {
        if (dirs.length < 1) {
            return process.nextTick(cb);
        }
        async.eachSeries(dirs, function (item, cb) {
            fs.mkdir(item, function (err) {
                if (err && !String(err.stack).match(/eexist/i)) {
                    console.error(err.stack || err);
                    cb(err);
                }
                else {
                    cb(null);
                }
            });
        }, cb);
    },
    padWithFourSpaces: function () {
        return new Array(5).join(' ');
    },
    padWithXSpaces: function (x) {
        return new Array(x + 1).join(' ');
    },
    removePath: function (p1, p2) {
        assert(path.isAbsolute(p1) && path.isAbsolute(p2), 'Please pass in absolute paths, ' +
            'p1 => ' + util.inspect(p1) + ', p2 => ' + util.inspect(p2));
        var split1 = String(p1).split(path.sep);
        var split2 = String(p2).split(path.sep);
        var newPath = [];
        var max = Math.max(split1.length, split2.length);
        for (var i = 0; i < max; i++) {
            if (split1[i] !== split2[i]) {
                newPath.push(split1[i]);
            }
        }
        return newPath.join(path.sep);
    },
    findSharedPath: function (p1, p2) {
        var split1 = String(p1).split(path.sep);
        var split2 = String(p2).split(path.sep);
        var one = split1.filter(function (i) { return i; });
        var two = split2.filter(function (i) { return i; });
        var max = Math.max(one.length, two.length);
        var i = 0;
        var shared = [];
        while (one[i] === two[i] && i < max) {
            shared.push(one[i]);
            i++;
            if (i > 100) {
                throw new Error(' => Suman implementation error => first array => ' + one + ', ' +
                    'second array => ' + two);
            }
        }
        shared = shared.filter(function (i) { return i; });
        return path.resolve(path.sep + shared.join(path.sep));
    },
    removeSharedRootPath: function (paths) {
        if (paths.length < 2) {
            return paths.map(function (p) {
                return [p, path.basename(p)];
            });
        }
        var shared;
        paths.forEach(function (p) {
            p = path.normalize(p);
            if (shared) {
                var arr = String(p).split('');
                var i_1 = 0;
                arr.every(function (item, index) {
                    if (String(item) !== String(shared[index])) {
                        i_1 = index;
                        return false;
                    }
                    return true;
                });
                shared = shared.slice(0, i_1);
            }
            else {
                shared = String(p).split('');
            }
        });
        return paths.map(function (p) {
            var basenameLngth = path.basename(p).length;
            return [p, p.substring(Math.min(shared.length, (p.length - basenameLngth)), p.length)];
        });
    },
    checkForValInStr: function (str, regex, count) {
        return ((String(str).match(regex) || []).length > (count === 0 ? 0 : (count || 1)));
    },
    isGeneratorFn2: function (fn) {
        var str = String(fn);
        var indexOfFirstParen = str.indexOf('(');
        var indexOfFirstStar = str.indexOf('*');
        return indexOfFirstStar < indexOfFirstParen;
    },
    isGeneratorFn: function (fn) {
        if (typeof fn !== 'function') {
            return false;
        }
        var fnStr = toStr.call(fn);
        return ((fnStr === '[object Function]' || fnStr === '[object GeneratorFunction]') && isFnRegex.test(fnToStr.call(fn))
            || (fn.constructor.name === 'GeneratorFunction' || fn.constructor.displayName === 'GeneratorFunction'));
    },
    isArrowFunction: function (fn) {
        return String(fn).trim().indexOf('function') !== 0;
    },
    isAsyncFn: function (fn) {
        return String(fn).trim().indexOf('async ') === 0;
    },
    defaultSumanHomeDir: function () {
        return path.normalize(path.resolve((process.env.HOME || process.env.USERPROFILE) + path.sep + 'suman_data'));
    },
    defaultSumanResultsDir: function () {
        return path.normalize(path.resolve(su.getHomeDir() + path.sep + 'suman' + path.sep + 'test_results'));
    },
    getHomeDir: function () {
        return process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
    },
    findProjectRoot: function findProjRoot(p) {
        if (!globalProjectRoot) {
            globalProjectRoot = residence.findProjectRoot(p);
        }
        return globalProjectRoot;
    },
    once: function (ctx, fn) {
        var callable = true;
        return function callOnce(err) {
            if (callable) {
                callable = false;
                return fn.apply(ctx, arguments);
            }
            else {
                console.log(' => Suman warning => function was called more than once -' + fn ? fn.toString() : '');
                if (err) {
                    console.error(' => Suman warning => \n', err.stack || util.inspect(err));
                }
            }
        };
    },
    onceAsync: function (ctx, fn) {
        var callable = true;
        return function callOnce(err) {
            var args = arguments;
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
        };
    },
    checkForEquality: function (arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        arr1 = arr1.sort();
        arr2 = arr2.sort();
        for (var i = 0; i < arr1.length; i++) {
            if (String(arr1[i]) !== String(arr2[i])) {
                return false;
            }
        }
        return true;
    },
    arrayHasDuplicates: function (a) {
        return !a.every(function (item, i) {
            return a.indexOf(item) === i;
        });
    },
    findNearestRunAndTransform: function (root, pth, cb) {
        console.log(' => root =>', root);
        console.log(' => path => ', pth);
        var ret = {
            run: null,
            transform: null
        };
        try {
            var isDir = fs.statSync(pth).isDirectory();
            if (!isDir) {
                pth = path.dirname(pth);
            }
        }
        catch (err) {
            return process.nextTick(function () {
                cb(err);
            });
        }
        var results = [];
        var upPath = pth;
        async.whilst(function () {
            return upPath.length >= root.length;
        }, function (cb) {
            console.log(' => oh no', upPath);
            async.parallel({
                run: function (cb) {
                    var p = path.resolve(upPath + '/@run.sh');
                    fs.stat(p, function (err, stats) {
                        var z = (stats && stats.isFile()) ? { run: p } : undefined;
                        z && results.push(z);
                        cb();
                    });
                },
                transform: function (cb) {
                    var p = path.resolve(upPath + '/@transform.sh');
                    fs.stat(p, function (err, stats) {
                        var z = (stats && stats.isFile()) ? { transform: p } : undefined;
                        z && results.push(z);
                        cb();
                    });
                }
            }, function (err) {
                upPath = path.resolve(upPath + '/../');
                cb(err);
            });
        }, function (err) {
            if (err) {
                cb(err);
            }
            else {
                var obj_1 = {};
                results.forEach(function (r) {
                    console.log('results => ', r);
                    if (r) {
                        obj_1 = Object.assign(obj_1, r);
                    }
                });
                console.log('obj => ', obj_1);
                cb(null, obj_1);
            }
        });
    },
    findSumanMarkers: function (types, root, files, cb) {
        var map = {};
        (function getMarkers(dir, cb) {
            fs.readdir(dir, function (err, items) {
                if (err) {
                    return cb(err);
                }
                items = items.map(function (item) {
                    return path.resolve(dir, item);
                });
                async.eachLimit(items, 5, function (item, cb) {
                    fs.stat(item, function (err, stats) {
                        if (err) {
                            console.log(' => [suman internal] => probably a symlink => ', item);
                            return cb();
                        }
                        if (stats.isFile()) {
                            var filename_1 = path.basename(item);
                            types.forEach(function (t) {
                                if (filename_1 === t) {
                                    if (!map[path.dirname(item)]) {
                                        map[path.dirname(item)] = {};
                                    }
                                    map[path.dirname(item)][t] = true;
                                }
                            });
                            cb();
                        }
                        else if (stats.isDirectory()) {
                            if (!/node_modules/.test(String(item)) && !/\/.git\//.test(String(item))) {
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
        })(root, function (err) {
            if (err) {
                cb(err);
            }
            else {
                cb(null, map);
            }
        });
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
};
su.default = su;
module.exports = su;
