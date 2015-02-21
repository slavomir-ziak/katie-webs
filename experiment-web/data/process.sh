rm martonova/*
for f in $(grep -r martonova _original/ | cut -d ":" -f1 | sort | uniq) ; do cp $f martonova/$RANDOM; done

rm katie/*
for f in $(grep -r nalada _original/ | cut -d ":" -f1 | sort | uniq) ; do cp $f katie/$RANDOM; done

# has to return 1 line
owner=martonova

for f in $(find $owner -type f) ; do cat $f | head -1; done | sort | uniq > ${owner}_data.csv

for f in $(find $owner -type f) ; do cat $f | tail -1 >> ${owner}_data.csv; done 

