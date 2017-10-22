'use strict';

//dts
import {IGlobalSumanObj} from "suman-types/dts/global";

//polyfills
const process = require('suman-browser-polyfills/modules/process');
const global = require('suman-browser-polyfills/modules/global');

//core
const util = require('util');

//project
const _suman : IGlobalSumanObj = global.__suman = (global.__suman || {});

///////////////////////////////////////

const execArgs = process.execArgv.slice(0);  //copy it

//////////////////////////////////////////////////////////

const IS_SUMAN_DEBUG = process.env.SUMAN_DEBUG === 'yes';
const inDebugMode = typeof global.v8debug === 'object';

const expressions = [
  /^--debug$/,
  /^debug$/,
  /^--inspect$/,
  /^--inspect-brk$/,
  /^--inspect-brk=[0-9]{1,5}$/,
  /^--debug=[0-9]{1,5}$/,
  /^--debug-brk=[0-9]{1,5}$/
];

// at least one of these conditions is true
const isDebug = expressions.some(function(exp){
   return execArgs.some(function(x: string){
     return exp.test(x);
   });
});

if (IS_SUMAN_DEBUG) {
  console.log('=> Exec args => ', util.inspect(execArgs), '\n');
}

if (isDebug) {
  console.log('=> we are debugging with the --debug flag');
}

if (inDebugMode) {
  console.log('=> we are debugging with the debug execArg');
}

export const weAreDebugging = _suman.weAreDebugging = (isDebug || inDebugMode);
