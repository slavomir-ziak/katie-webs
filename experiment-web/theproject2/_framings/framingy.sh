#!/bin/bash


##{
#	"description" : "",
#	"optionA" : "",
#	"optionB" : ""
#}
echo "["
for f in $(ls framingy) 
do
	declare -i counter=0
	
	cat framingy/$f | while read line
	do
		(( counter=$counter + 1 ))
		#echo $line >> out.txt
		#echo $counter
		if (( $counter % 3 == 1 )) 
		then 
			echo "{"
			echo "\"description\" : \"$line\"," 
		fi

		if (( $counter % 3 == 2 )) 
		then 
			echo "\"optionA\" : \"$line\"," 
		fi

		if (( $counter % 3 == 0 )) 
		then 
			echo "\"optionB\" : \"$line\""  
			echo "},"
		fi

		

	done
	
done
echo "]"