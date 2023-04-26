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
exit_if_failed() {
  exit_code=$1
  message="$2"

  if [ $exit_code -ne 0 ]; then
    if [ ! -z "$message" ]; then
      echo_error "$message"
    fi
    exit $exit_code
  fi
}

echo_info "npm run all..."
npm run all
exit_if_failed $? "npm run all failed"

build_dirs_status=$(git status --short dist/ lib/)
exit_if_failed $? "Get git status failed."

if [ "$build_dirs_status" != "" ]; then
  echo_error "There are uncommitted files in 'dist' and 'lib' dirs. Please commit them before pushing."
  exit 1
fi
