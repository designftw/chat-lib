#!/bin/bash
set -ex

echo 'serving frontend'
browser-sync start --server --watch --port 3333 --no-ui &

# serve the output directory
mkdir -p out;
echo 'serving docs'
pushd out;
browser-sync start --server --watch --port 5000 --no-ui &
popd;

# remake jsdoc on change
fd -e .js -e .MD | entr jsdoc -r js -R README.md &

# use ctrl-c to exit
read -r -d '' _ </dev/tty

