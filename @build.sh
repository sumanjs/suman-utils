#!/usr/bin/env bash

cd $(dirname "$0")
rm -rf node_modules &&
npm install || { echo "not installed successfuly :(";  exit 1; }
./@transpile.sh
./@link.sh