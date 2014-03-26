DB_USER=forms_viewer
DB_PASSWORD=dasboot
DB_HOST=ngdbdev.hq.gratex.com
DB_PORT=1521
DB_NAME=NGDEV1

sql_login_pilot () 
{ 
    export db_connection_str=$DB_USER/$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME;
    export db_connection_schema="UNIUS"
}

# foobar proxy setup for sqlplus sake
export http_proxy="http://foo:bar@host";
export https_proxy="http://foo:bar@host";
export no_proxy=bar

# setup path to tooling
export PATH=$PATH:./db:./bash

sql_login_pilot

echo "Setuping SQL tooling"

. db/_sql 

echo "Setuping AUDIT tooling"

. audit.sh

echo "Test DB connectivity...."
echo $(sql "select 'sucess !' from dual;" | grep sucess)
echo "Setup GTI tooling is done"