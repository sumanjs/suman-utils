#!/usr/bin/env bash

cd $(dirname "$0")

SUMAN=$(which suman);

if [[ -z ${SUMAN} ]]; then
npm install -g suman
fi

suman test
