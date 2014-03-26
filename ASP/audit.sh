## wrapper for easy auditing

# this is statefull code, so let's define few global variables
#AUDIT_LAST_STAMP=""		# mils
#AUDIT_LAST_STAMP_MILS=""
#AUDIT_SETTINGS=""		#currently holds only user name, we are auditing by user names
#AUDIT_NAME=""			# nice name of auditing mission old.insert, new.update etc... base name for all folder/file names

## Experimental
## read audit.md for help
			
audit_start(){

	AUDIT_SETTINGS=$1
	AUDIT_NAME=$2
	
	echo "AUDIT_SETTINGS: $AUDIT_SETTINGS" 1>&2
	echo "AUDIT_NAME: $AUDIT_NAME" 1>&2	
	
	if [[ -z $AUDIT_SETTINGS || -z $AUDIT_NAME ]]
	then
		echo "ERR: AUDIT_SETTINGS or AUDIT_NAME missing, exit" 1>&2
		return 1	
	fi	
	
	AUDIT_LAST_STAMP=$(db-audit-trail-last $AUDIT_SETTINGS)
	AUDIT_LAST_STAMP_MILS=$(cut -d" " -f1 <<< $AUDIT_LAST_STAMP)
	
	echo "AUDIT_LAST_STAMP: $AUDIT_LAST_STAMP" 1>&2
	echo "AUDIT_LAST_STAMP_MILS: $AUDIT_LAST_STAMP_MILS" 1>&2
	
	
}
audit_end(){
	mkdir $AUDIT_NAME 
	db-audit-trail $AUDIT_SETTINGS $AUDIT_LAST_STAMP_MILS | tee $AUDIT_NAME/all.txt
	audit_get_details $AUDIT_NAME <<< "$(cat $AUDIT_NAME/all.txt | awk '{print $2" "$4"."$6"."$7}')"
}

_audit_grep(){

	git --no-pager grep --no-index "$@" -- $AUDIT_NAME/all.txt 

}
# audit_analyze_form_api FORM_NAME
# creates 	$form_name.api.txt 	- table of all API used by form 
#			form-api.txt		- list of actual used api
#			SQL strings and BIND variables to all API calls
audit_analyze_form_api(){
	form_name=$1
	formDepsCached $form_name > $AUDIT_NAME/$form_name.api.txt
	grep -f $AUDIT_NAME/$form_name.api.txt $AUDIT_NAME/all.txt | grep -v "SYS." | tee $AUDIT_NAME/form-api.txt

	#audit_get_details $AUDIT_NAME <<< "$(cat $AUDIT_NAME/form-api.txt | awk '{print $2" "$4"."$6"."$7}')"
}

# audit_analyze_tables 
# creates 	tables.txt			- list of executed SQL commands 
#			SQL strings and BIND variables to all API calls
audit_analyze_tables(){
	
	cat $AUDIT_NAME/all.txt | grep "\bTABLE\b" | grep -v "SYS." | tee $AUDIT_NAME/tables.txt	
	#audit_get_details $AUDIT_NAME <<< "$(cat $AUDIT_NAME/tables.txt | awk '{print $2" "$4"."$6"."$7}')"
}

audit_analyze_non_form_api() {
	form_name=$1
	formDepsCached $form_name > $AUDIT_NAME/$form_name.api.txt
	grep -fv $AUDIT_NAME/$form_name.api.txt $AUDIT_NAME/all.txt | grep "\bVIEW\b" grep -v "SYS."  tee $AUDIT_NAME/form-api.txt
	
}

audit_compare_tables(){
	
	if [ $# == 0 ] 
	then
		echo "Enter audit names."
		return
	fi

	echo "Filtering:$1/tables.txt:" 1>&2
	cat $1/tables.txt | awk '{print $6" "$7" "$8}' | tee $1.compare.tables.txt 1>&2

	echo "Filtering:$2/tables.txt:" 1>&2
	cat $2/tables.txt | awk '{print $6" "$7" "$8}' | tee $2.compare.tables.txt 1>&2

	git --no-pager diff --no-index $1.compare.tables.txt $2.compare.tables.txt
}

audit_compare_form_api() {

	if [ $# == 0 ] 
	then
		echo "Enter audit names."
		return
	fi

	echo "Filtering:$1/form-api.txt:" 1>&2
	cat $1/form-api.txt | awk '{print $6" "$7" "$8}' | tee $1.compare.form-api.txt 1>&2

	echo "Filtering:$2/form-api.txt:" 1>&2
	cat $2/form-api.txt | awk '{print $6" "$7" "$8}' | tee $2.compare.form-api.txt 1>&2

	git --no-pager diff --no-index $1.compare.form-api.txt $2.compare.form-api.txt

}


# audit_compare_groupped_matrix
# 	zohladnuje len co a kolko krat sa volalo, prehladnejsie
#
#	audit_compare_form_api_groupped_matrix old.compare.tables.txt new.compare.tables.txt | clmn -d '|' 
#	audit_compare_form_api_groupped_matrix old.compare.form-api.txt new.compare.form-api.txt | clmn -d '|'
audit_compare_groupped_matrix(){

	file1=$1
	file2=$2

	cat $file1 | sort | uniq -c | awk '{print $2,$3,$4"|"$1}' > $file1.groupped
 	cat $file2 | sort | uniq -c | awk '{print $2,$3,$4"|"$1}' > $file2.groupped
	
	echo "API|$file1|$file2"
	join -1 1 -2 1 -t "|" -a 1 -a 2 -o 0 1.2 2.2 -e - $file1.groupped $file2.groupped
}

# donwloads session details for each session.entry id from stdin and saves in $1 folder 
audit_get_details(){	

	while read x
	do
		entry_id=$(cut -d" " -f1 <<< $x)
		name=$(tr " " "." <<< $x)
		db-audit-trail-detail $entry_id >  $AUDIT_NAME/$name.sql.txt
	done
}


#
# audit_run USER_NAME FORM_NAME [first-name second-name]
#
# shortcut to execute all audit steps, just by pressing enter
#
audit_run() {

	local user=$1
	local formName=$2

	if [[ -z $user || -z $formName ]] 
	then
		. _usagef.sh "${BASH_SOURCE[0]}" "audit_run" 1>&2
		return
	fi

	local firstName=${3:-'old'}
	local secondName=${4:-'new'}

	rm -rf "$firstName" "$secondName" "$firstName"compare.txt "$secondName"compare.txt 

	# clear
	echo "To start audit session for '$firstName' press enter"
	read

	db-audit-on $user
	audit_start $user $firstName
	
	# clear
	echo "You can work in '$firstName' now, all action will be audited"
	echo "To end audit session for '$firstName' press enter"
	read

	audit_end 2>&1 >/dev/null
	audit_analyze_tables 2>&1 >/dev/null
	audit_analyze_form_api $formName 2>&1 >/dev/null

	# clear
	echo "To start audit session for '$secondName' press enter"
	read

	audit_start $user $secondName

	# clear
	echo "You can work in '$secondName' now, all action will be audited"
	echo "To end audit session for '$secondName' press enter"
	read

	audit_end 2>&1 >/dev/null
	audit_analyze_tables 2>&1 >/dev/null
	audit_analyze_form_api $formName 2>&1 >/dev/null

	db-audit-off $user
	
	# clear
	echo "Audit for user $user if off."
	echo "Use audit_compare_tables and audit_compare_form_api to see deffirences."
}


 # print usage when sourced
 # countOfSharps - the number of sharps to be displayed, default=1(not need to specify)
countOfSharps=2
. _usage.sh "${BASH_SOURCE[0]}" $countOfSharps 1>&2


# zohaldnuje poradie prikazov, vacsinou nepouzitelne
_audit_compare_form_api_ordered_matrix(){
	file1=$1
	file2=$2

	awk '{print NR$1$2$3"|"$1, $2, $3}' < $file1 > $file1.ordered
	awk '{print NR$1$2$3"|"$1, $2, $3}' < $file2 > $file2.ordered

	join -1 1 -2 1 -t "|" -a 1 -a 2 -o 0 1.2 2.2 -e - $file1.ordered $file2.ordered

}
