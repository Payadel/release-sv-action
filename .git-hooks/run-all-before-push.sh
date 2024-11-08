#!/bin/bash

set -e # Exit on errors

echo "npm run all..."
npm run all

build_dirs_status=$(git status --short dist/ lib/)

if [ -n "$build_dirs_status" ]; then
  echo_error "There are uncommitted files in 'dist' and 'lib' dirs. Please commit them before pushing."
  exit 1
fi

exit 0