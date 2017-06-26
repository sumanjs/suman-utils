'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var process = require('suman-browser-polyfills/modules/process');
var global = require('suman-browser-polyfills/modules/global');
var util = require('util');
var _suman = global.__suman = (global.__suman || {});
var execArgs = process.execArgv.slice(0);
var IS_SUMAN_DEBUG = process.env.SUMAN_DEBUG === 'yes';
var inDebugMode = typeof global.v8debug === 'object';
var expressions = [
    '--debug',
    'debug',
    '--inspect',
    '--debug=5858',
    '--debug-brk=5858'
];
var isDebug = expressions.some(function (x) { return execArgs.indexOf(x) > -1; });
if (IS_SUMAN_DEBUG) {
    console.log('=> Exec args => ', util.inspect(execArgs), '\n');
}
if (isDebug) {
    console.log('=> we are debugging with the --debug flag');
}
if (inDebugMode) {
    console.log('=> we are debugging with the debug execArg');
}
exports.weAreDebugging = _suman.weAreDebugging = (isDebug || inDebugMode);
var $exports = module.exports;
exports.default = $exports;