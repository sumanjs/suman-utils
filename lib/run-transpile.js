'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var process = require('suman-browser-polyfills/modules/process');
var global = require('suman-browser-polyfills/modules/global');
process.on('warning', function (w) {
    console.error('\n', ' => Suman-Utils warning => ', (w.stack || w), '\n');
});
var fs = require("fs");
var path = require("path");
var util = require("util");
var assert = require("assert");
var cp = require("child_process");
var async = require('async');
var colors = require('colors/safe');
var debug = require('suman-debug')('s:utils-transpile');
var _suman = global.__suman = (global.__suman || {});
exports.$runTranspile = function (paths, opts, cb) {
    console.log(' => Paths to transpile => \n', util.inspect(paths));
    var testDir = process.env.TEST_DIR;
    var testSrcDir = process.env.TEST_SRC_DIR;
    var testTargetDir = process.env.TEST_TARGET_DIR;
    var testTargetDirLength = String(testTargetDir).split(path.sep).length;
    var transpileLogDir = process.env.SUMAN_TRANSPILE_LOG_PATH;
    var projectRoot = process.env.SUMAN_PROJECT_ROOT;
    var sumanUtils = require('./all.js');
    var sumanOpts = _suman.sumanOpts;
    var strm = fs.createWriteStream(process.env.SUMAN_TRANSPILE_LOG_PATH);
    var errorExperiencedInATLeastOneChildProcess = false;
    var testSrcDirLength = String(testSrcDir).split(path.sep).length;
    var testTargetDirLength = String(testTargetDir).split(path.sep).length;
    var babelExec;
    try {
        babelExec = opts.babelExec || path.resolve(require.resolve('babel-cli'), '..', '..', '.bin/babel');
        fs.lstatSync(babelExec);
    }
    catch (err) {
        console.error(colors.cyan(' => Suman error finding Babel executable => '), colors.red(err.stack || err));
        console.error(colors.red(' => Warning, Suman will attempt to use a globally installed version of Babel.'));
        babelExec = String(cp.execSync('which babel')).trim();
        console.log(' => Resolved path of babel executable => ', babelExec);
    }
    debug(' => Istanbul executable located here => ', babelExec);
    assert.equal(testSrcDirLength, testTargetDirLength, ' => Suman usage error => "testSrcDir" and "testTargetDir" must be at the same level in your project => \n' +
        'See: http://oresoftware.github.io/suman');
    if (opts.all) {
        debug('opts.all for transpile is true');
        try {
            assert(testDir && typeof testDir === 'string');
        }
        catch (err) {
            return cb(new Error('You wanted a transpilation run, but you need to define the testDir ' +
                'property in your suman.conf.js file.' + '\n' + err.stack));
        }
        if (paths.length > 0) {
            console.error(colors.yellow(' => Suman warning => Because the --all option was used,' +
                ' suman will ignore the following arguments passed at the command line:'), '\n', paths);
        }
        cp.exec('rm -rf ' + testTargetDir, function (err, stdout, stderr) {
            if (err || String(stdout).match(/error/i) || String(stderr).match(/error/i)) {
                cb(err || stdout || stderr);
            }
            else {
                var cmd1 = ['cd', projectRoot, '&&', babelExec, testSrcDir, '--out-dir', testTargetDir, '--copy-files'].join(' ');
                if (sumanOpts.verbose) {
                    console.log('\n', colors.cyan.bgBlack(' => Babel-cli command will be run:\n'), colors.yellow.bgBlack(cmd1), '\n');
                }
                cp.exec(cmd1, function (err) {
                    if (err || String(stdout).match(/error/i) || String(stderr).match(/error/i)) {
                        cb('You may need to run $ suman --use-babel to install the' +
                            ' necessary babel dependencies in your project so suman can use them => \n' + (err.stack || err) || stdout || stderr);
                    }
                    else {
                        console.log(stdout ? '\n' + stdout : '');
                        console.log(stderr ? '\n' + stderr : '');
                        if (!sumanOpts.sparse) {
                            console.log('\t' + colors.bgGreen.white.bold(' => Suman messsage => Your entire "' + testDir + '" directory '));
                            console.log('\t' + colors.bgGreen.white.bold(' was successfully transpiled/copied to the "' + testTargetDir + '" directory. ') + '\n');
                        }
                        setImmediate(function () {
                            cb(null, paths.map(sumanUtils.mapToTargetDir));
                        });
                    }
                });
            }
        });
    }
    else {
        debug('opts.all for transpile is false');
        debug('opts.sameDir for transpile is false');
        try {
            assert(paths.length > 0, colors.bgBlack.yellow(' => Suman error => please pass at least one test file path in your command.'));
        }
        catch (err) {
            return cb(err);
        }
        debug(' => targetDir:', testTargetDir);
        debug(' => paths before array =>', paths);
    }
    paths = paths.map(function (item) {
        return path.resolve(path.isAbsolute(item) ? item : (projectRoot + '/' + item));
    });
    debug(' => paths after array (should be absolute now) =>', paths);
    var dirsToBuild = [];
    paths.forEach(function (p) {
        if (p) {
            dirsToBuild.push(sumanUtils.getArrayOfDirsToBuild(testTargetDir, p));
        }
    });
    debug(' => dirsToBuild:', dirsToBuild);
    var filteredDirsToBuild = dirsToBuild.filter(function (d, index, arr) {
        return !sumanUtils.checkIfPathAlreadyExistsInList(arr, d, index);
    });
    debug(' => filtered dirsToBuild:', filteredDirsToBuild);
    sumanUtils.buildDirsWithMkDirp(filteredDirsToBuild, function (err) {
        if (err) {
            return cb(err);
        }
        debug(' => Root of project => ', projectRoot);
        debug(' => "testTargetDir" => ', testTargetDir);
        async.mapLimit(paths, 5, function (item, cb) {
            var fsItemTemp = sumanUtils.mapToTargetDir(item);
            var fsItem = fsItemTemp.targetPath;
            debug(' => Item to be transpiled:', item);
            debug(' => fsItem:', fsItem);
            fs.stat(item, function (err, stats) {
                if (err) {
                    return cb(err);
                }
                var cmd;
                if (stats.isFile()) {
                    if (path.extname(item) === '.js' || path.extname(item) === '.jsx') {
                        cmd = [babelExec, item, '--out-file', fsItem];
                        if (sumanOpts.verbose) {
                            console.log('\n ' + colors.bgCyan.magenta.bold(' => Test file will be transpiled to => ') + colors.bgCyan.black(fsItem));
                        }
                    }
                    else {
                        cmd = ['cp', item, fsItem];
                        console.log('\n ' + colors.bgCyan.magenta.bold(' => Test fixture file will be copied to => ' + fsItem));
                    }
                }
                else {
                    cmd = [babelExec, item, '--out-dir', fsItem, '--copy-files'];
                    console.log('\n\n ' + colors.bgMagenta.cyan.bold(' => Directory will be transpiled to => '), '\n', colors.bgWhite.black.bold(' ' + fsItem + ' '));
                }
                if (sumanOpts.verbose) {
                    console.log('\n', colors.cyan.bgBlack(' => The following "babel-cli" command will be run:\n'), colors.yellow.bgBlack(cmd), '\n');
                }
                var k = cp.spawn('bash', [], {
                    cwd: projectRoot
                });
                var $cmd = cmd.join(' ');
                k.stdin.write('\n' + $cmd + '\n');
                process.nextTick(function () {
                    k.stdin.end();
                });
                k.stderr.pipe(strm);
                k.stderr.once('data', function () {
                    errorExperiencedInATLeastOneChildProcess = true;
                });
                k.once('close', function (code) {
                    k.unref();
                    if (code > 0) {
                        console.log(colors.bgRed(' => You probably need to run "$ suman --use-babel" to install the' +
                            ' necessary babel dependencies in your project so suman can use them...'));
                    }
                    cb(null, fsItemTemp);
                });
            });
        }, function (err) {
            if (err) {
                console.error(err.stack || err);
            }
            if (errorExperiencedInATLeastOneChildProcess) {
                console.log(colors.yellow.bold(' => Suman warning => A transpilation process may have ' +
                    'experienced an error, check the log.'));
            }
            strm.end();
            cb(err);
        });
    });
};
var $exports = module.exports;
exports.default = $exports;
