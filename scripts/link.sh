#!/usr/bin/env bash

cd $(dirname "$0")
npm link suman-debug -f
npm link
npm link suman-utils
