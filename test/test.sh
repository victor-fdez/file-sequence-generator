#!/usr/bin/env bash
if [ "$CIRCLE_PROJECT_REPONAME" != "" ]; then
  mocha --reporter mocha-junit-reporter
else
  mocha --reporter spec
fi
