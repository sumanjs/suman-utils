#!/usr/bin/env bash

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" == "master" && "$1" != "-f" ]]; then
    echo "Aborting script because you are not on the right git branch.";
    echo "You can use the -f flag to override this";
    exit 1;
fi

###########################################
# CM = "commit message"...default is "set"
###########################################

CM=${1:-set}

git add . &&
git add -A &&
git commit --allow-empty -am "pdev:$CM" &&
git push
