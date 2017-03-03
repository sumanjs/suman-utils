#!/usr/bin/env bash

cd $(dirname "$0") &&
NPM_ROOT=$(npm root)

if [[ -z ${NPM_ROOT} ]]; then
 echo "NPM_ROOT is not defined" && exit 1;
fi

echo "transpiling from TypeScript to JS..."
./@transpile.sh
echo "Now we are starting the Suman tests"
./node_modules/.bin/suman test/target