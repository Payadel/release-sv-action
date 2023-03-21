#!/bin/bash

script_name="$(basename -- $0)"

say_message() {
  local message="$1"
  echo "$script_name: $message"
}

say_message "npm run all..."
npm run all

build_dirs_status=$(git status --short dist/ lib/)
result_code=$?
if [ $result_code != 0 ]; then
  say_message "Error! Get git status failed."
  exit $?
fi

if [ "$build_dirs_status" != "" ]; then
  say_message "Error! There are uncommitted files in 'dist' and 'lib' dirs. Please commit them before pushing."
  exit 1
fi
