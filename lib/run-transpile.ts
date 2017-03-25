'use strict';

process.on('warning', function (w: any) {
    console.error('\n', ' => Suman-Utils warning => ', (w.stack || w), '\n');
});


//core
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as assert from 'assert';
import * as cp from 'child_process';

//npm
const async = require('async');
const colors = require('colors/safe');
const debug = require('suman-debug')('s:utils-transpile');

//project
const sumanUtils = require('./all');

////////////////////////////////////////////////////////////////////////////////////////////////

const projectRoot = process.env.SUMAN_PROJECT_ROOT;

// note => these values were originally assigned in suman/index.js,
// were then passed to suman server, which then required this file
const testDir = process.env.TEST_DIR;
const testSrcDir = process.env.TEST_SRC_DIR;
const testTargetDir = process.env.TEST_TARGET_DIR;
const testTargetDirLength = String(testTargetDir).split(path.sep).length;
const transpileLogDir = process.env.SUMAN_TRANSPILE_LOG_PATH;

// debug('=> (in suman-utils) => process.env =', process.env);

//////////////////////////////////////////////////////


export interface IOpts {
    babelExec?: string,
    all?: boolean
}

//////////////////////////////////////////////////////

export default function run(paths: Array<string>, opts: IOpts, cb: Function): void {

    const sumanOpts = global.sumanOpts;

    // let fd;
    //
    // try {
    //   fd = fs.openSync(process.env.SUMAN_TRANSPILE_LOG_PATH,{});
    // }
    // catch (err) {
    //   console.error(err.stack || err);
    // }

    const strm = fs.createWriteStream(process.env.SUMAN_TRANSPILE_LOG_PATH);
    let errorExperiencedInATLeastOneChildProcess = false;

    const testSrcDirLength = String(testSrcDir).split(path.sep).length;
    const testTargetDirLength = String(testTargetDir).split(path.sep).length;

    let babelExec: string;

    try {
        babelExec = opts.babelExec || path.resolve(require.resolve('babel-cli'), '..', '..', '.bin/babel');
        fs.lstatSync(babelExec);
    }
    catch (err) {
        console.error(colors.cyan(' => Suman error finding Babel executable => '), colors.red(err.stack || err));
        console.error(colors.red(' => Warning, Suman will attempt to use a globally installed version of Babel.'));
        babelExec = String(cp.execSync('which babel')).trim();
    }

    debug(' => Istanbul executable located here => ', babelExec);

    assert.equal(testSrcDirLength, testTargetDirLength,
        ' => Suman usage error => "testSrcDir" and "testTargetDir" must be at the same level in your project => \n' +
        'See: http://oresoftware.github.io/suman');

    if (opts.all) {   //TODO: opts.all should just be opts.recursive ??

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

        //TODO: use rimraf or what not, instead of cp
        cp.exec('rm -rf ' + testTargetDir, function (err: Error, stdout: string, stderr: string) {
            if (err || String(stdout).match(/error/i) || String(stderr).match(/error/i)) {
                cb(err || stdout || stderr);
            }
            else {

                const cmd1 = ['cd', projectRoot, '&&', babelExec, testSrcDir, '--out-dir', testTargetDir, '--copy-files'].join(' ');

                if (sumanOpts.verbose) {
                    console.log('\n', colors.cyan.bgBlack(' => Babel-cli command will be run:\n'), colors.yellow.bgBlack(cmd1), '\n');
                }

                cp.exec(cmd1, function (err: Error) {
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
    else {  //opts.all == false

        debug('opts.all for transpile is false');

        // here we want two things to be faster:
        // no runner, so we save 100ms
        // transpile and option to only copy only 1 .js file

        // if (dirs.length > 0) {
        // 	return cb(new Error('--optimized option uses the testSrcDir property of your config, ' +
        // 		'but you specified a dir option as an argument.'))
        // }
        //
        // dirs = [testDir];

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

    paths = paths.map((item: string) => {
        return path.resolve(path.isAbsolute(item) ? item : (projectRoot + '/' + item));
    });

    debug(' => paths after array (should be absolute now) =>', paths);

    const dirsToBuild: Array<string> = [];

    paths.forEach(function (p: string) {
        if (p) {
            dirsToBuild.push(sumanUtils.getArrayOfDirsToBuild(testTargetDir, p));
        }
    });

    debug(' => dirsToBuild:', dirsToBuild);

    const filteredDirsToBuild = dirsToBuild.filter(function (d, index, arr) {
        return !sumanUtils.checkIfPathAlreadyExistsInList(arr, d, index);
    });

    debug(' => filtered dirsToBuild:', filteredDirsToBuild);

    sumanUtils.buildDirsWithMkDirp(filteredDirsToBuild, function (err: Error) {  //make test-target dir in case it doesn't exist

        if (err) {
            return cb(err);
        }

        debug(' => Root of project => ', projectRoot);
        debug(' => "testTargetDir" => ', testTargetDir);

        // arbitrarily limit to 5 concurrent "babel processes".
        async.mapLimit(paths, 5, function (item: string, cb: Function): void {

            const fsItemTemp = sumanUtils.mapToTargetDir(item);
            const fsItem = fsItemTemp.targetPath;

            debug(' => Item to be transpiled:', item);
            debug(' => fsItem:', fsItem);

            fs.stat(item, function (err: Error, stats: Object) {

                if (err) {
                    return cb(err);
                }

                let cmd: Array<string>;

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
                    console.log('\n\n ' + colors.bgMagenta.cyan.bold(' => Directory will be transpiled to => '), '\n',
                        colors.bgWhite.black.bold(' ' + fsItem + ' '));
                }

                if (sumanOpts.verbose) {
                    console.log('\n', colors.cyan.bgBlack(' => The following "babel-cli" command will be run:\n'),
                        colors.yellow.bgBlack(cmd), '\n');
                }

                let k = cp.spawn('bash', [], {
                    cwd: projectRoot
                });

                let $cmd: string = cmd.join(' ');
                k.stdin.write('\n' + $cmd + '\n');

                process.nextTick(function () {
                    k.stdin.end();
                });

                k.stderr.pipe(strm);

                k.stderr.once('data', function () {
                    errorExperiencedInATLeastOneChildProcess = true;
                });

                k.once('close', function (code: number): void {
                    k.unref();
                    if (code > 0) {
                        console.log(colors.bgRed(' => You probably need to run "$ suman --use-babel" to install the' +
                            ' necessary babel dependencies in your project so suman can use them...'));
                    }
                    cb(null, fsItemTemp);
                });

            });

        }, function (err: Error) {

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

}

