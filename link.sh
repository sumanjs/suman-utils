#!/usr/bin/env bash


cd $(dirname "$0")
rm -rf node_modules
npm install

npm link suman-debug -f

# finally we link suman-utils
npm link