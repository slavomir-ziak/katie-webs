#!/bin/bash

rm *txt

IFS=$'\n\r'

for l in $(node process2.js); do

	echo $l

	kind=$(cut -d ' ' -f1 <<< $l)
	color=$(cut -d ' ' -f2 <<< $l)
	column=$(cut -d ' ' -f3 <<< $l)

	file="${kind}_${color}.txt"
	
	if [[ "$(cat $file 2> /dev/null | wc -l)" == "      0" ]] 
	then 


	cat katie_data_filtered.csv | cut -d ';' -f $column > temp.txt

	paste -d ';' $file temp.txt > temp2.txt

	mv temp2.txt $file
done

unset IFS

for f in $("cas_black.txt cas_black2.txt  cas_green.txt  cas_red.txt  cas_yellow.txt  katie_data_filtered.csv  process2.js  split.sh  temp.txt  vyhodnotenie_black.txt  vyhodnotenie_green.txt  vyhodnotenie_red.txt  vyhodnotenie_yellow.txt") ; do echo $f; done;
cat cas_black.txt | cut -d ';' -f 2- > cas_black2.txt