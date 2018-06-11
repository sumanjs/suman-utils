#!/usr/bin/env bash

set -e;

npm link suman
node test/src/find-markers.js
