#!/usr/bin/env bash

set -e;

npm install --loglevel=warn

tsc || echo "whatevs"

npm link -f --loglevel=warn

npm link suman-utils --loglevel=warn

npm install --loglevel=warn -g \
 "https://raw.githubusercontent.com/oresoftware/tarballs/master/tgz/oresoftware/suman.tgz?$(date +%s)"


