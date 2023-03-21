#!/bin/bash

npm run all

build_dirs_status=$(git status --short dist/ lib/)
result_code=$?
if [ $result_code != 0 ]; then
  echo "Get git status failed."
  exit $?
fi

if [ "$build_dirs_status" != "" ]; then
  echo "There are uncommitted files in 'dist' and 'lib' dirs. Please commit them before pushing."
  exit 1
fi
