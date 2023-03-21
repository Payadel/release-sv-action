#!/bin/bash

RED="31"
BLUE="34"
BOLD_RED="\e[1;${RED}m"
BOLD_BLUE="\e[1;${BLUE}m"
END_COLOR="\e[0m"

echo_info() {
  echo -e "${BOLD_BLUE}Info: $1 ${END_COLOR}"
}
echo_error() {
  echo -e "${BOLD_RED}Error: $1 ${END_COLOR}" >&2
}

echo_info "npm run all..."
npm run all

build_dirs_status=$(git status --short dist/ lib/)
result_code=$?
if [ $result_code != 0 ]; then
  echo_error "Get git status failed."
  exit $?
fi

if [ "$build_dirs_status" != "" ]; then
  echo_error "There are uncommitted files in 'dist' and 'lib' dirs. Please commit them before pushing."
  exit 1
fi
