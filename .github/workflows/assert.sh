#!/bin/bash

actual="$1"
expected="$2"

if [ "$expected" != "$actual" ]; then
  echo "Error! expected ($expected) != actual($actual)"
  exit 1
fi
