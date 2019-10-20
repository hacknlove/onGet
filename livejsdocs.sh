#!/bin/bash

rm -r docs

npx jsdoc -c ./jsdoc.config.json

set -o errexit
set -o nounset

keystroke="CTRL+F5"

# find all visible browser windows
browser_windows="$(xdotool search --sync --all --onlyvisible --classname Navigator)"
echo $browser_windows
# Send keystroke
for bw in $browser_windows; do
    xdotool key --window "$bw" "$keystroke"
done
