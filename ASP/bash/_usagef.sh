#!/bin/bash

## helper libraries for bash scripts to build usage messages from BASH comments

## _usagef - collects comments for one method
## expects fileName as argument, usually it is used as this:
## . _usagef.sh "${BASH_SOURCE[0]}" 1>&2

echo "Usage:
"
cat "$( cd "$( dirname "$1" )" && pwd )/$(basename ""$1"")" \
| sed -n "/^# $2/,/^$2/p" | sed '$d' \
| sed $'s;\t;    ;'

# this is GIGO style, 
# TODO: nicer withou sed "$d"


