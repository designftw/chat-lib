#!/bin/bash
set -ex

echo 'serving frontend'
pushd starter
live-server --port=3000 &
popd;

echo 'serving js'
pushd js
live-server  --port=5000 --cors &
popd;

# serve the output directory
mkdir -p docs;
echo 'serving docs'
pushd docs;
live-server --port=9999 &
popd;

# remake jsdoc on change
fd -e .js -e .MD | entr jsdoc -r js -R README.md -d docs &

# use ctrl-c to exit
read -r -d '' _ </dev/tty

