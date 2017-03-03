#!/usr/bin/env bash

GIT_COMMIT_MSG=$1 # first argument to script

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "master" ]]; then
  echo 'Aborting script because you are not on the right git branch (dev).';
  exit 1;
fi

git add . &&
git add -A &&
git commit --allow-empty -am "pre:${GIT_COMMIT_MSG}" &&
git pull &&
git add . &&
git add -A &&
git commit --allow-empty -am "publish/release:${GIT_COMMIT_MSG}" &&
npm version patch --force &&
git push &&
npm publish . &&
echo "published to NPM successfully"

