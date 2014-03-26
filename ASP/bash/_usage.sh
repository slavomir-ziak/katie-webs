#!/bin/bash

## helper libraries for bash scripts to build usage messages from BASH comments
# specially in areas of help man etc.

## _comments2usage - collects all top level comments from file and prints to stderr
## expects fileName as argument, usually it is used as this:
## . _usage.sh "${BASH_SOURCE[0]}" 1>&2
## specifying the number of sharps:
## . _usage.sh "${BASH_SOURCE[0]}" $countOfSharps 1>&2

sharpCount=$2
[[ ! "$sharpCount" ]] && sharpCount=1
grep "^#\{"$sharpCount"\}" "$( cd "$( dirname "$1" )" && pwd )/$(basename ""$1"")" \
| grep -v -e "^#-*$"


