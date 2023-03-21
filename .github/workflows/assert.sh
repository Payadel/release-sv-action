#!/bin/bash

actual="$1"
expected="$2"
name="$3"

if [ ! -z "$name" ]; then
  printf "$name: "
fi
if [ "$expected" != "$actual" ]; then
  echo "Error! expected ($expected) != actual ($actual)"
  exit 1
else
  echo "Success! expected ($expected) == actual ($actual)"
fi
