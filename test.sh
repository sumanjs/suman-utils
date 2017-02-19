#!/usr/bin/env bash

cd $(dirname "$0")
rm -rf node_modules
npm install
./node_modules/.bin/suman