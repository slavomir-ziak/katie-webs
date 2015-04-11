#!/bin/bash

rm *txt
#rm *csv

IFS=$'\n\r'

for l in $(node process2.js); do

	echo $l

	kind=$(cut -d ' ' -f1 <<< $l)
	color=$(cut -d ' ' -f2 <<< $l)
	column=$(cut -d ' ' -f3 <<< $l)

	file="${kind}_${color}.txt"
	
	if [[ "$(cat $file 2> /dev/null | wc -l)" == "      0" ]] 
	then 
	echo "" > $file
fi


	cat $1 | cut -d ';' -f $column > temp.txt

	paste -d ';' $file temp.txt > temp2.txt

	mv temp2.txt $file


done

unset IFS

cat cas_black.txt  | cut -d ';' -f 2- >  cas_black.csv
cat cas_green.txt  | cut -d ';' -f 2- > cas_green.csv
cat cas_red.txt   | cut -d ';' -f 2- > cas_red.csv
cat cas_yellow.txt   | cut -d ';' -f 2- > cas_yellow.csv
cat vyhodnotenie_black.txt   | cut -d ';' -f 2- > vyhodnotenie_black.csv
cat vyhodnotenie_green.txt   | cut -d ';' -f 2- > vyhodnotenie_green.csv
cat vyhodnotenie_red.txt   | cut -d ';' -f 2- > vyhodnotenie_red.csv
cat vyhodnotenie_yellow.txt  | cut -d ';' -f 2- > vyhodnotenie_yellow.csv

