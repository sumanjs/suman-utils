#!/usr/bin/env bash

set -e;

cd $(dirname "$0")

SUMAN="$(which suman)";

if [[ -z "${SUMAN}" ]]; then
    npm install -g suman
fi

npm link suman
suman test/src/all.test.js
